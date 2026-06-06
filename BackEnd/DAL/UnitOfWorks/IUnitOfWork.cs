using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.UnitOfWorks
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository UserRepo { get; }
        ITokenRepository TokenRepo { get; }
        IVehicleTypeRepository VehicleTypeRepo { get; }
        IFloorRepository FloorRepo { get; }
        IGateRepository GateRepo { get; }
        IParkingSlotRepository ParkingSlotRepo { get; }
        IParkingCardRepository ParkingCardRepo { get; }
        IMonthlySubscriptionRepository MonthlySubscriptionRepo { get; }
        IParkingSessionRepository ParkingSessionRepo { get; }
        IIncidentReportRepository IncidentReportRepo { get; }
        Task<int> SaveAsync();  
        Task<bool> SaveChangeAsync();
    }
}
