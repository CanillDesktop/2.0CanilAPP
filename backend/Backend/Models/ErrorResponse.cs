namespace Backend.Models
{
    public class ErrorResponse
    {
        public int Status { get; set; }
        public string Details { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
    }
}
