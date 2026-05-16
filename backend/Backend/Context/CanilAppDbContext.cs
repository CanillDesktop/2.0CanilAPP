using Backend.Models;
using Backend.Models.Insumos;
using Backend.Models.Medicamentos;
using Backend.Models.Produtos;
using Backend.Models.Usuarios;
using Backend.Models.Estoque;
using Microsoft.EntityFrameworkCore;

namespace Backend.Context;

public class CanilAppDbContext : DbContext
{
    public CanilAppDbContext(DbContextOptions<CanilAppDbContext> options) : base(options)
    {
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        BumpItemEstoqueVersaoParaAlteracoesRastreadas();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        BumpItemEstoqueVersaoParaAlteracoesRastreadas();
        return base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Garante que cada UPDATE persista um novo valor de Versao (WHERE Versao = valor original).
    /// Caminhos que usam ExecuteUpdate já atualizam Versao na própria instrução SQL.
    /// </summary>
    private void BumpItemEstoqueVersaoParaAlteracoesRastreadas()
    {
        foreach (var entry in ChangeTracker.Entries<ItemEstoqueModel>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.Versao++;
        }
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
            .HasKey(i => new { i.Id, i.Lote });

        modelBuilder.Entity<ItemEstoqueModel>()
            .HasOne(i => i.ItemBase)
            .WithMany(p => p.ItensEstoque)
            .HasForeignKey(i => i.Id)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItemEstoqueModel>()
            .Property(i => i.Versao)
            .IsConcurrencyToken();

        modelBuilder.Entity<ItemNivelEstoqueModel>()
            .HasKey(i => i.Id);

        modelBuilder.Entity<ItemNivelEstoqueModel>()
            .HasOne(i => i.ItemBase)
            .WithOne(p => p.ItemNivelEstoque)
            .HasForeignKey<ItemNivelEstoqueModel>(i => i.Id)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItemComEstoqueBaseModel>()
            .Property(i => i.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<ProdutosModel>()
            .HasBaseType<ItemComEstoqueBaseModel>();

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .HasKey(r => r.Id);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .Property(r => r.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .HasOne<UsuariosModel>()
            .WithMany()
            .HasForeignKey(r => r.IdUsuarioRetirante)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .HasOne<UsuariosModel>()
            .WithMany()
            .HasForeignKey(r => r.IdUsuarioRecebedor)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .HasIndex(r => r.DataHoraRetirada);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .HasIndex(r => r.IdUsuarioRetirante);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .HasIndex(r => r.IdUsuarioRecebedor);

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .Property(r => r.Status)
            .HasMaxLength(48);
    }
}
