using BLL.Interfaces;
using Common.DTOs;
using Common.DTOs.ParkingOperation;
using DAL.Models;
using DAL.UnitOfWorks;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;

namespace BLL.Implements
{
    public class ParkingOperationService : IParkingOperationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private static readonly string[] GuestFloorKeywords = { "vang lai" };
        private static readonly string[] ResidentFloorKeywords = { "thang", "cu dan" };

        public ParkingOperationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResponseDTO> GuestCheckInAsync(GuestCheckInDTO dto)
        {
            if (dto == null) return new ResponseDTO("Du lieu check-in khach vang lai khong hop le", 400, false);

            var validation = await ValidateCheckInBaseAsync(dto.LicensePlate, dto.VehicleTypeId, dto.GateId, dto.CardId, dto.CardCode, true);
            if (validation.Error != null) return validation.Error;

            var activeValidation = await ValidateNoActiveSessionAsync(validation.LicensePlate!, validation.Card);
            if (activeValidation != null) return activeValidation;

            var slot = await FindAvailableSlotAsync(dto.VehicleTypeId, GuestFloorKeywords);
            if (slot == null) return new ResponseDTO("Khong con cho trong cho khach vang lai", 409, false);

            var session = new ParkingSession
            {
                SessionId = Guid.NewGuid(),
                CardId = validation.Card!.CardId,
                LicensePlateIn = validation.LicensePlate!,
                EntryImageUrl = NormalizeOptional(dto.EntryImageUrl),
                VehicleTypeId = dto.VehicleTypeId,
                EntryTime = DateTime.Now,
                EntryGateId = dto.GateId,
                AssignedSlotId = slot.SlotId,
                ActualSlotId = slot.SlotId,
                Status = "Active"
            };

            slot.Status = "Occupied";
            validation.Card.Status = "InUse";

            await _unitOfWork.ParkingSessionRepo.AddAsync(session);
            await _unitOfWork.ParkingSlotRepo.UpdateAsync(slot);
            await _unitOfWork.ParkingCardRepo.UpdateAsync(validation.Card);
            await _unitOfWork.SaveChangeAsync();

            return new ResponseDTO("Check-in khach vang lai thanh cong", 201, true, await GetSessionDTOAsync(session.SessionId));
        }

        public async Task<ResponseDTO> GuestCheckOutAsync(GuestCheckOutDTO dto)
        {
            if (dto == null) return new ResponseDTO("Du lieu checkout khach vang lai khong hop le", 400, false);

            var exitGateValidation = await ValidateGateTypeAsync(dto.GateId, "Exit");
            if (exitGateValidation != null) return exitGateValidation;

            var sessionResult = await FindActiveSessionAsync(dto.SessionId, dto.LicensePlate, dto.CardId, dto.CardCode, true);
            if (sessionResult.Error != null) return sessionResult.Error;

            var session = sessionResult.Session!;
            var plateValidation = await ValidatePlateOutAsync(session, dto.LicensePlateOut);
            if (plateValidation != null) return plateValidation;

            await CloseSessionAsync(session, dto.GateId, dto.LicensePlateOut, dto.ExitImageUrl, DateTime.Now);
            await _unitOfWork.SaveChangeAsync();

            return new ResponseDTO("Checkout khach vang lai thanh cong", 200, true, await GetSessionDTOAsync(session.SessionId));
        }

        public async Task<ResponseDTO> ResidentCheckInAsync(ResidentCheckInDTO dto)
        {
            if (dto == null) return new ResponseDTO("Du lieu check-in cu dan khong hop le", 400, false);

            var validation = await ValidateCheckInBaseAsync(dto.LicensePlate, dto.VehicleTypeId, dto.GateId, dto.CardId, dto.CardCode, false);
            if (validation.Error != null) return validation.Error;

            var now = DateTime.Now;
            var subscription = await _unitOfWork.MonthlySubscriptionRepo.GetAll()
                .FirstOrDefaultAsync(s =>
                    s.LicensePlate.ToLower() == validation.LicensePlate!.ToLower()
                    && s.VehicleTypeId == dto.VehicleTypeId
                    && s.Status == "Active"
                    && s.StartDate <= now
                    && s.EndDate >= now);

            if (subscription == null) return new ResponseDTO("Khong tim thay goi thang hop le cho bien so nay", 403, false);

            var activeValidation = await ValidateNoActiveSessionAsync(validation.LicensePlate!, validation.Card);
            if (activeValidation != null) return activeValidation;

            var slot = await FindAvailableSlotAsync(dto.VehicleTypeId, ResidentFloorKeywords);
            if (slot == null) return new ResponseDTO("Khong con cho trong cho cu dan", 409, false);

            var session = new ParkingSession
            {
                SessionId = Guid.NewGuid(),
                CardId = validation.Card?.CardId,
                DriverUserId = subscription.UserId,
                LicensePlateIn = validation.LicensePlate!,
                EntryImageUrl = NormalizeOptional(dto.EntryImageUrl),
                VehicleTypeId = dto.VehicleTypeId,
                EntryTime = now,
                EntryGateId = dto.GateId,
                AssignedSlotId = slot.SlotId,
                ActualSlotId = slot.SlotId,
                Status = "Active"
            };

            slot.Status = "Occupied";
            if (validation.Card != null) validation.Card.Status = "InUse";

            await _unitOfWork.ParkingSessionRepo.AddAsync(session);
            await _unitOfWork.ParkingSlotRepo.UpdateAsync(slot);
            if (validation.Card != null) await _unitOfWork.ParkingCardRepo.UpdateAsync(validation.Card);
            await _unitOfWork.SaveChangeAsync();

            return new ResponseDTO("Check-in cu dan thanh cong", 201, true, await GetSessionDTOAsync(session.SessionId));
        }

        public async Task<ResponseDTO> ResidentCheckOutAsync(ResidentCheckOutDTO dto)
        {
            if (dto == null) return new ResponseDTO("Du lieu checkout cu dan khong hop le", 400, false);

            var exitGateValidation = await ValidateGateTypeAsync(dto.GateId, "Exit");
            if (exitGateValidation != null) return exitGateValidation;

            var sessionResult = await FindActiveSessionAsync(dto.SessionId, dto.LicensePlate, dto.CardId, dto.CardCode, false);
            if (sessionResult.Error != null) return sessionResult.Error;

            var session = sessionResult.Session!;
            var subscription = await _unitOfWork.MonthlySubscriptionRepo.GetAll()
                .FirstOrDefaultAsync(s =>
                    s.LicensePlate.ToLower() == session.LicensePlateIn.ToLower()
                    && s.VehicleTypeId == session.VehicleTypeId
                    && s.Status == "Active");

            if (subscription == null) return new ResponseDTO("Phien gui xe nay khong thuoc goi thang hop le", 403, false);

            var plateValidation = await ValidatePlateOutAsync(session, dto.LicensePlateOut);
            if (plateValidation != null) return plateValidation;

            await CloseSessionAsync(session, dto.GateId, dto.LicensePlateOut, dto.ExitImageUrl, DateTime.Now);
            await _unitOfWork.SaveChangeAsync();

            return new ResponseDTO("Checkout cu dan thanh cong", 200, true, await GetSessionDTOAsync(session.SessionId));
        }

        public async Task<ResponseDTO> GetAvailabilityAsync(Guid? vehicleTypeId, string? floorKeyword)
        {
            var slots = await _unitOfWork.ParkingSlotRepo.GetAll()
                .Include(s => s.Floor)
                .Include(s => s.VehicleType)
                .Where(s => !vehicleTypeId.HasValue || s.VehicleTypeId == vehicleTypeId.Value)
                .ToListAsync();

            if (!string.IsNullOrWhiteSpace(floorKeyword))
            {
                var normalizedKeyword = RemoveDiacritics(floorKeyword).ToLower();
                slots = slots
                    .Where(s => s.Floor != null && RemoveDiacritics(s.Floor.FloorName).ToLower().Contains(normalizedKeyword))
                    .ToList();
            }

            var result = slots
                .GroupBy(s => new { s.FloorId, s.Floor.FloorName, VehicleTypeId = (Guid?)s.VehicleTypeId, VehicleTypeName = s.VehicleType.TypeName })
                .Select(g => new ParkingAvailabilityDTO
                {
                    FloorId = g.Key.FloorId,
                    FloorName = g.Key.FloorName,
                    VehicleTypeId = g.Key.VehicleTypeId,
                    VehicleTypeName = g.Key.VehicleTypeName,
                    TotalSlots = g.Count(),
                    AvailableSlots = g.Count(s => s.Status == "Available"),
                    OccupiedSlots = g.Count(s => s.Status == "Occupied"),
                    ReservedSlots = g.Count(s => s.Status == "Reserved")
                })
                .OrderBy(a => a.FloorName)
                .ToList();

            return new ResponseDTO("Lay tinh trang cho trong thanh cong", 200, true, result);
        }

        private async Task<(string? LicensePlate, ParkingCard? Card, ResponseDTO? Error)> ValidateCheckInBaseAsync(
            string? licensePlate,
            Guid vehicleTypeId,
            Guid gateId,
            Guid? cardId,
            string? cardCode,
            bool requireCard)
        {
            if (string.IsNullOrWhiteSpace(licensePlate)) return (null, null, new ResponseDTO("Vui long nhap bien so", 400, false));
            if (vehicleTypeId == Guid.Empty) return (null, null, new ResponseDTO("Vui long chon loai phuong tien", 400, false));

            var vehicleTypeExists = await _unitOfWork.VehicleTypeRepo.AnyAsync(v => v.VehicleTypeId == vehicleTypeId);
            if (!vehicleTypeExists) return (null, null, new ResponseDTO("Loai phuong tien khong ton tai", 400, false));

            var gateValidation = await ValidateGateTypeAsync(gateId, "Entry");
            if (gateValidation != null) return (null, null, gateValidation);

            var cardResult = await ResolveCardAsync(cardId, cardCode, requireCard, true);
            if (cardResult.Error != null) return (null, null, cardResult.Error);

            return (NormalizePlate(licensePlate), cardResult.Card, null);
        }

        private async Task<ResponseDTO?> ValidateGateTypeAsync(Guid gateId, string expectedGateType)
        {
            if (gateId == Guid.Empty) return new ResponseDTO("Vui long chon cong", 400, false);

            var gate = await _unitOfWork.GateRepo.GetByIdAsync(gateId);
            if (gate == null) return new ResponseDTO("Cong khong ton tai", 400, false);
            if (!string.Equals(gate.GateType, expectedGateType, StringComparison.OrdinalIgnoreCase))
            {
                return new ResponseDTO($"Cong phai la loai {expectedGateType}", 400, false);
            }

            return null;
        }

        private async Task<(ParkingCard? Card, ResponseDTO? Error)> ResolveCardAsync(Guid? cardId, string? cardCode, bool requireCard, bool requireActive)
        {
            if (!cardId.HasValue && string.IsNullOrWhiteSpace(cardCode))
            {
                return requireCard ? (null, new ResponseDTO("Vui long nhap the xe", 400, false)) : (null, null);
            }

            ParkingCard? card = null;
            if (cardId.HasValue)
            {
                card = await _unitOfWork.ParkingCardRepo.GetByIdAsync(cardId.Value);
            }

            if (!string.IsNullOrWhiteSpace(cardCode))
            {
                var cardByCode = await _unitOfWork.ParkingCardRepo.FindByCodeAsync(cardCode);
                if (cardByCode == null) return (null, new ResponseDTO("Khong tim thay ma the xe", 404, false));
                if (card != null && card.CardId != cardByCode.CardId)
                {
                    return (null, new ResponseDTO("CardId va CardCode khong khop", 400, false));
                }
                card = cardByCode;
            }

            if (card == null) return (null, new ResponseDTO("Khong tim thay the xe", 404, false));
            if (requireActive && card.Status != "Active")
            {
                return (null, new ResponseDTO("The xe khong o trang thai Active", 409, false));
            }

            return (card, null);
        }

        private async Task<ResponseDTO?> ValidateNoActiveSessionAsync(string licensePlate, ParkingCard? card)
        {
            var hasActivePlate = await _unitOfWork.ParkingSessionRepo.AnyAsync(s => s.Status == "Active" && s.LicensePlateIn.ToLower() == licensePlate.ToLower());
            if (hasActivePlate) return new ResponseDTO("Bien so dang co phien gui xe active", 409, false);

            if (card != null)
            {
                var hasActiveCard = await _unitOfWork.ParkingSessionRepo.AnyAsync(s => s.Status == "Active" && s.CardId == card.CardId);
                if (hasActiveCard) return new ResponseDTO("The xe dang co phien gui xe active", 409, false);
            }

            return null;
        }

        private async Task<ParkingSlot?> FindAvailableSlotAsync(Guid vehicleTypeId, string[] floorKeywords)
        {
            var slots = await _unitOfWork.ParkingSlotRepo.GetAll()
                .Include(s => s.Floor)
                .Where(s => s.VehicleTypeId == vehicleTypeId && s.Status == "Available")
                .OrderBy(s => s.SlotCode)
                .ToListAsync();

            return slots.FirstOrDefault(s => FloorMatches(s.Floor?.FloorName, floorKeywords));
        }

        private async Task<(ParkingSession? Session, ResponseDTO? Error)> FindActiveSessionAsync(Guid? sessionId, string? licensePlate, Guid? cardId, string? cardCode, bool requireCardWhenNoSessionId)
        {
            if (!sessionId.HasValue && string.IsNullOrWhiteSpace(licensePlate) && !cardId.HasValue && string.IsNullOrWhiteSpace(cardCode))
            {
                return (null, new ResponseDTO("Vui long nhap SessionId hoac bien so/the xe", 400, false));
            }

            var query = QuerySessionsWithIncludes().Where(s => s.Status == "Active");

            if (sessionId.HasValue)
            {
                query = query.Where(s => s.SessionId == sessionId.Value);
            }

            if (!string.IsNullOrWhiteSpace(licensePlate))
            {
                var plate = NormalizePlate(licensePlate);
                query = query.Where(s => s.LicensePlateIn.ToLower() == plate.ToLower());
            }

            if (cardId.HasValue || !string.IsNullOrWhiteSpace(cardCode))
            {
                var cardResult = await ResolveCardAsync(cardId, cardCode, false, false);
                if (cardResult.Error != null) return (null, cardResult.Error);
                if (cardResult.Card != null) query = query.Where(s => s.CardId == cardResult.Card.CardId);
            }
            else if (requireCardWhenNoSessionId && !sessionId.HasValue)
            {
                return (null, new ResponseDTO("Vui long nhap the xe khi khong co SessionId", 400, false));
            }

            var session = await query.FirstOrDefaultAsync();
            if (session == null) return (null, new ResponseDTO("Khong tim thay phien gui xe active", 404, false));

            return (session, null);
        }

        private async Task<ResponseDTO?> ValidatePlateOutAsync(ParkingSession session, string? licensePlateOut)
        {
            if (string.IsNullOrWhiteSpace(licensePlateOut)) return null;

            var normalizedPlateOut = NormalizePlate(licensePlateOut);
            if (normalizedPlateOut == session.LicensePlateIn) return null;

            await CreateIncidentIfPossibleAsync(session, "PlateMismatch", $"Bien so ra {normalizedPlateOut} khong khop bien so vao {session.LicensePlateIn}.");
            await _unitOfWork.SaveChangeAsync();
            return new ResponseDTO("Bien so ra khong khop bien so vao", 409, false);
        }

        private async Task CloseSessionAsync(ParkingSession session, Guid exitGateId, string? licensePlateOut, string? exitImageUrl, DateTime exitTime)
        {
            session.ExitGateId = exitGateId;
            session.ExitTime = exitTime;
            session.LicensePlateOut = string.IsNullOrWhiteSpace(licensePlateOut) ? session.LicensePlateIn : NormalizePlate(licensePlateOut);
            session.ExitImageUrl = NormalizeOptional(exitImageUrl);
            session.Status = "Completed";

            if (session.ActualSlotId.HasValue)
            {
                var actualSlot = await _unitOfWork.ParkingSlotRepo.GetByIdAsync(session.ActualSlotId.Value);
                if (actualSlot != null)
                {
                    actualSlot.Status = "Available";
                    await _unitOfWork.ParkingSlotRepo.UpdateAsync(actualSlot);
                }
            }

            if (session.AssignedSlotId.HasValue && session.AssignedSlotId != session.ActualSlotId)
            {
                var assignedSlot = await _unitOfWork.ParkingSlotRepo.GetByIdAsync(session.AssignedSlotId.Value);
                if (assignedSlot != null)
                {
                    assignedSlot.Status = "Available";
                    await _unitOfWork.ParkingSlotRepo.UpdateAsync(assignedSlot);
                }
            }

            if (session.CardId.HasValue)
            {
                var card = await _unitOfWork.ParkingCardRepo.GetByIdAsync(session.CardId.Value);
                if (card != null)
                {
                    card.Status = "Active";
                    await _unitOfWork.ParkingCardRepo.UpdateAsync(card);
                }
            }

            await _unitOfWork.ParkingSessionRepo.UpdateAsync(session);
        }

        private IQueryable<ParkingSession> QuerySessionsWithIncludes()
        {
            return _unitOfWork.ParkingSessionRepo.GetAll()
                .Include(s => s.Card)
                .Include(s => s.DriverUser)
                .Include(s => s.VehicleType)
                .Include(s => s.EntryGate)
                .Include(s => s.ExitGate)
                .Include(s => s.AssignedSlot)
                .Include(s => s.ActualSlot);
        }

        private async Task<Common.DTOs.ParkingSession.ParkingSessionDTO?> GetSessionDTOAsync(Guid sessionId)
        {
            var session = await QuerySessionsWithIncludes().FirstOrDefaultAsync(s => s.SessionId == sessionId);
            return session == null ? null : ParkingSessionService.MapToDTO(session);
        }

        private async Task CreateIncidentIfPossibleAsync(ParkingSession session, string issueType, string description)
        {
            if (!session.DriverUserId.HasValue) return;

            var incident = new IncidentReport
            {
                IncidentId = Guid.NewGuid(),
                SessionId = session.SessionId,
                ReportedByUserId = session.DriverUserId.Value,
                IssueType = issueType,
                Description = description,
                Status = "Open"
            };

            await _unitOfWork.IncidentReportRepo.AddAsync(incident);
        }

        private static string NormalizePlate(string plate)
        {
            return plate.Trim().ToUpper();
        }

        private static string? NormalizeOptional(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static bool FloorMatches(string? floorName, string[] keywords)
        {
            if (string.IsNullOrWhiteSpace(floorName)) return false;

            var normalizedFloorName = RemoveDiacritics(floorName).ToLower();
            return keywords.Any(normalizedFloorName.Contains);
        }

        private static string RemoveDiacritics(string value)
        {
            var normalized = value.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder(normalized.Length);

            foreach (var c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(c);
                }
            }

            return builder.ToString().Normalize(NormalizationForm.FormC);
        }
    }
}
