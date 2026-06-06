using System;

namespace Common.DTOs.ParkingOperation
{
    public class GuestCheckInDTO
    {
        public string LicensePlate { get; set; }
        public Guid VehicleTypeId { get; set; }
        public Guid GateId { get; set; }
        public Guid? CardId { get; set; }
        public string? CardCode { get; set; }
        public string? EntryImageUrl { get; set; }
    }

    public class GuestCheckOutDTO
    {
        public Guid? SessionId { get; set; }
        public string? LicensePlate { get; set; }
        public Guid? CardId { get; set; }
        public string? CardCode { get; set; }
        public Guid GateId { get; set; }
        public string? LicensePlateOut { get; set; }
        public string? ExitImageUrl { get; set; }
    }

    public class ResidentCheckInDTO
    {
        public string LicensePlate { get; set; }
        public Guid VehicleTypeId { get; set; }
        public Guid GateId { get; set; }
        public Guid? CardId { get; set; }
        public string? CardCode { get; set; }
        public string? EntryImageUrl { get; set; }
    }

    public class ResidentCheckOutDTO
    {
        public Guid? SessionId { get; set; }
        public string? LicensePlate { get; set; }
        public Guid GateId { get; set; }
        public Guid? CardId { get; set; }
        public string? CardCode { get; set; }
        public string? LicensePlateOut { get; set; }
        public string? ExitImageUrl { get; set; }
    }

    public class ParkingAvailabilityDTO
    {
        public Guid FloorId { get; set; }
        public string FloorName { get; set; }
        public Guid? VehicleTypeId { get; set; }
        public string? VehicleTypeName { get; set; }
        public int TotalSlots { get; set; }
        public int AvailableSlots { get; set; }
        public int OccupiedSlots { get; set; }
        public int ReservedSlots { get; set; }
    }
}
