using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public abstract class BaseModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public DateTime DataHoraCriacao {  get; set; } = DateTime.UtcNow;
        public DateTime DataHoraAtualizacao { get; set; } = DateTime.UtcNow;
        public string EditadorPor { get; set; } = string.Empty;
        public bool IsDeleted { get; set; } = false;
    }
}
