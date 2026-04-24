namespace Backend.Models
{
    public abstract class BaseModel
    {
        public DateTime DataHoraCriacao {  get; set; } = DateTime.UtcNow;
        public DateTime DataHoraAtualizacao { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
