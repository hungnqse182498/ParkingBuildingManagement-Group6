using BLL.Interfaces;
using Common.DTOs.IncidentReport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PBMS.Extensions;
using System;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace PBMS.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class IncidentReportController : ControllerBase
    {
        private readonly IIncidentReportService _incidentReportService;

        public IncidentReportController(IIncidentReportService incidentReportService)
        {
            _incidentReportService = incidentReportService;
        }

        [HttpGet]
        [Authorize(Roles = "Manager, Staff")]
        public async Task<IActionResult> GetAll()
        {
            var res = await _incidentReportService.GetAllAsync();
            return StatusCode(res.StatusCode, res);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var res = await _incidentReportService.GetByIdAsync(id);
            return StatusCode(res.StatusCode, res);
        }

        [HttpGet("my-reports")]
        public async Task<IActionResult> GetMyIncidents()
        {
            var userId = User.GetUserId();

            if (userId == Guid.Empty)
            {
                return Unauthorized(new { message = "Không thể xác thực danh tính từ Token" });
            }

            var res = await _incidentReportService.GetByUserIdAsync(userId);
            return StatusCode(res.StatusCode, res);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateIncidentReportDTO dto)
        {
            if (dto.ReportedByUserId == Guid.Empty)
            {
                dto.ReportedByUserId = User.GetUserId();
            }
            var res = await _incidentReportService.CreateAsync(dto);
            return StatusCode(res.StatusCode, res);
        }

        [HttpPut]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Update([FromBody] UpdateIncidentReportDTO dto)
        {
            var res = await _incidentReportService.UpdateAsync(dto);
            return StatusCode(res.StatusCode, res);
        }

        [HttpPatch("{id:guid}/status")]
        [Authorize(Roles = "Manager, Staff")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest req)
        {
            var incident = await _incidentReportService.GetByIdAsync(id);
            if (incident == null || !incident.IsSuccess || incident.Result == null)
            {
                return NotFound(new { message = "Không tìm thấy sự cố" });
            }

            var resultStr = JsonSerializer.Serialize(incident.Result);
            var incidentDTO = JsonSerializer.Deserialize<IncidentReportDTO>(resultStr, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (incidentDTO == null)
            {
                return BadRequest(new { message = "Lỗi xử lý dữ liệu sự cố" });
            }

            string targetStatus = req.Status?.Trim();
            if (string.Equals(targetStatus, "Đã xử lý", StringComparison.OrdinalIgnoreCase) || string.Equals(targetStatus, "Resolved", StringComparison.OrdinalIgnoreCase))
            {
                targetStatus = "Resolved";
            }
            else if (string.Equals(targetStatus, "Chờ xử lý", StringComparison.OrdinalIgnoreCase) || string.Equals(targetStatus, "Open", StringComparison.OrdinalIgnoreCase))
            {
                targetStatus = "Open";
            }

            var updateDto = new UpdateIncidentReportDTO
            {
                IncidentId = incidentDTO.IncidentId,
                SessionId = incidentDTO.SessionId,
                ReportedByUserId = incidentDTO.ReportedByUserId,
                IssueType = incidentDTO.IssueType,
                Description = incidentDTO.Description,
                ProofImageUrl = incidentDTO.ProofImageUrl,
                Status = targetStatus,
                HandledByStaffId = User.GetUserId(),
                ResolutionNotes = req.ResolutionNotes ?? incidentDTO.ResolutionNotes,
                ResolvedAt = (targetStatus == "Resolved") ? DateTime.UtcNow : null
            };

            var res = await _incidentReportService.UpdateAsync(updateDto);
            return StatusCode(res.StatusCode, res);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Manager, Staff")]
        public async Task<IActionResult> UpdateById(Guid id, [FromBody] UpdateStatusRequest req)
        {
            return await UpdateStatus(id, req);
        }

        [HttpPut("{id:guid}/assign/{staffId:guid}")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> AssignStaff(Guid id, Guid staffId)
        {
            var response = await _incidentReportService.AssignToStaffAsync(id, staffId);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPut("{id:guid}/resolve/{staffId:guid}")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> ResolveIncident(Guid id, Guid staffId, [FromBody] ResolveIncidentDTO dto)
        {
            var response = await _incidentReportService.ResolveAsync(id, staffId, dto);
            return StatusCode(response.StatusCode, response);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var res = await _incidentReportService.DeleteAsync(id);
            return StatusCode(res.StatusCode, res);
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; }
        public string? ResolutionNotes { get; set; }
    }
}
