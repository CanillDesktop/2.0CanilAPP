using Backend.Models;
using Backend.Models.Estoque;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Backend.Models.Usuarios;
using Microsoft.EntityFrameworkCore;

namespace Backend.Context;

public class CanilAppDbContext : DbContext
{
    public CanilAppDbContext(DbContextOptions<CanilAppDbContext> options) : base(options)
    {
    }

    public DbSet<MedicamentosModel> Medicamentos { get; set; }
    public DbSet<ProdutosModel> Produtos { get; set; }
    public DbSet<UsuariosModel> Usuarios { get; set; }
    public DbSet<InsumosModel> Insumos { get; set; }
    public DbSet<ItemNivelEstoqueModel> ItensNivelEstoque { get; set; }
    public DbSet<ItemEstoqueModel> ItensEstoque { get; set; }
    public DbSet<RetiradaEstoqueModel> RetiradaEstoque { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; } 

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ItemComEstoqueBaseModel>().ToTable("ItensBase");
        modelBuilder.Entity<ProdutosModel>().ToTable("Produtos");
        modelBuilder.Entity<InsumosModel>().ToTable("Insumos");
        modelBuilder.Entity<MedicamentosModel>().ToTable("Medicamentos");

        modelBuilder.Entity<ItemEstoqueModel>()
            .HasKey(i => new { i.IdItem, i.Lote });

        modelBuilder.Entity<ItemEstoqueModel>()
            .HasOne(i => i.ItemBase)
            .WithMany(p => p.ItensEstoque)
            .HasForeignKey(i => i.IdItem)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItemNivelEstoqueModel>()
            .HasKey(i => i.IdItem);

        modelBuilder.Entity<ItemNivelEstoqueModel>()
            .HasOne(i => i.ItemBase)
            .WithOne(p => p.ItemNivelEstoque)
            .HasForeignKey<ItemNivelEstoqueModel>(i => i.IdItem)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItemComEstoqueBaseModel>()
            .Property(i => i.IdItem)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<ProdutosModel>()
            .HasBaseType<ItemComEstoqueBaseModel>();

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .HasKey(r => r.IdRetirada);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .Property(r => r.IdRetirada)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .Property(r => r.DataHoraCriacao)
            .HasDefaultValue(DateTime.UtcNow);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .Property(r => r.DataHoraAtualizacao)
            .HasDefaultValue(DateTime.UtcNow);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .Property(r => r.IsDeleted)
            .HasDefaultValue(false);
    }
}
