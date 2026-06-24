using Backend.Models;
using Backend.Models.CodigoAcesso;
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
    public DbSet<CodigoAcessoModel> CodigoAcesso { get; set; }
    public DbSet<ContadorLoteModel> ContadoresLote { get; set; }
    public DbSet<UnidadeEstoqueModel> UnidadesEstoque { get; set; }
    public DbSet<UsuarioUnidadeEstoqueModel> UsuariosUnidadesEstoque { get; set; }
    public DbSet<MovimentacaoEstoqueModel> MovimentacoesEstoque { get; set; }
    public DbSet<TransferenciaEstoqueModel> TransferenciasEstoque { get; set; }
    public DbSet<TransferenciaEstoqueItemModel> TransferenciasEstoqueItens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ItemComEstoqueBaseModel>().ToTable("ItensBase");
        modelBuilder.Entity<ProdutosModel>().ToTable("Produtos");
        modelBuilder.Entity<InsumosModel>().ToTable("Insumos");
        modelBuilder.Entity<MedicamentosModel>().ToTable("Medicamentos");

        modelBuilder.Entity<UnidadeEstoqueModel>(e =>
        {
            e.HasIndex(u => u.Sigla).IsUnique();
            e.HasData(
                new UnidadeEstoqueModel
                {
                    Id = UnidadeEstoqueIds.Secretaria,
                    Nome = "Secretaria",
                    Sigla = "SEC",
                    Tipo = "ADMINISTRATIVO",
                    Ativa = true,
                    DataCadastro = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    DataHoraCriacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    DataHoraAtualizacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    EditadorPor = "Sistema",
                },
                new UnidadeEstoqueModel
                {
                    Id = UnidadeEstoqueIds.Canil,
                    Nome = "Canil",
                    Sigla = "CAN",
                    Tipo = "OPERACIONAL",
                    Ativa = true,
                    DataCadastro = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    DataHoraCriacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    DataHoraAtualizacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    EditadorPor = "Sistema",
                });
        });

        modelBuilder.Entity<ItemEstoqueModel>()
            .HasKey(i => new { i.Id, i.IdUnidadeEstoque, i.Lote });

        modelBuilder.Entity<ItemEstoqueModel>()
            .HasOne(i => i.ItemBase)
            .WithMany(p => p.ItensEstoque)
            .HasForeignKey(i => i.Id)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItemEstoqueModel>()
            .HasOne(i => i.UnidadeEstoque)
            .WithMany()
            .HasForeignKey(i => i.IdUnidadeEstoque)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemEstoqueModel>()
            .Property(i => i.Versao)
            .IsConcurrencyToken();

        modelBuilder.Entity<ItemEstoqueModel>()
            .HasIndex(i => new { i.IdUnidadeEstoque, i.Lote })
            .IsUnique();

        modelBuilder.Entity<ItemEstoqueModel>()
            .HasIndex(i => i.IdUnidadeEstoque);

        modelBuilder.Entity<ContadorLoteModel>()
            .Property(c => c.Versao)
            .IsConcurrencyToken();

        modelBuilder.Entity<ItemNivelEstoqueModel>()
            .HasKey(i => new { i.Id, i.IdUnidadeEstoque });

        modelBuilder.Entity<ItemNivelEstoqueModel>()
            .HasOne(i => i.ItemBase)
            .WithMany(p => p.ItensNivelEstoque)
            .HasForeignKey(i => i.Id)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ItemNivelEstoqueModel>()
            .HasOne(i => i.UnidadeEstoque)
            .WithMany()
            .HasForeignKey(i => i.IdUnidadeEstoque)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ItemComEstoqueBaseModel>()
            .Property(i => i.Id)
            .ValueGeneratedOnAdd();

        modelBuilder.Entity<ProdutosModel>()
            .HasBaseType<ItemComEstoqueBaseModel>();

        modelBuilder.Entity<MedicamentosModel>()
            .HasBaseType<ItemComEstoqueBaseModel>();

        modelBuilder.Entity<InsumosModel>()
            .HasBaseType<ItemComEstoqueBaseModel>();

        AplicarConversoresUtc(modelBuilder);

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
            .HasIndex(r => new { r.IdUnidadeEstoque, r.DataHoraRetirada });

        modelBuilder.Entity<RetiradaEstoqueModel>()
            .Property(r => r.Status)
            .HasMaxLength(48);

        modelBuilder.Entity<UsuarioUnidadeEstoqueModel>(e =>
        {
            e.HasKey(x => new { x.IdUsuario, x.IdUnidadeEstoque });
            e.HasOne(x => x.Usuario)
                .WithMany()
                .HasForeignKey(x => x.IdUsuario)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.UnidadeEstoque)
                .WithMany(u => u.Usuarios)
                .HasForeignKey(x => x.IdUnidadeEstoque)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MovimentacaoEstoqueModel>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Id).ValueGeneratedOnAdd();
            e.HasIndex(m => new { m.IdUnidadeEstoque, m.DataHoraMovimentacao });
            e.HasIndex(m => new { m.IdItem, m.Lote });
            e.HasIndex(m => m.IdTransferencia);
            e.HasOne(m => m.UnidadeEstoque).WithMany().HasForeignKey(m => m.IdUnidadeEstoque);
            e.HasOne(m => m.Item).WithMany().HasForeignKey(m => m.IdItem);
            e.HasOne(m => m.Transferencia).WithMany().HasForeignKey(m => m.IdTransferencia);
            e.HasOne(m => m.Retirada).WithMany().HasForeignKey(m => m.IdRetirada);
            e.HasOne(m => m.Usuario).WithMany().HasForeignKey(m => m.IdUsuario);
        });

        modelBuilder.Entity<TransferenciaEstoqueModel>(e =>
        {
            e.HasOne(t => t.UnidadeOrigem).WithMany().HasForeignKey(t => t.IdUnidadeOrigem).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.UnidadeDestino).WithMany().HasForeignKey(t => t.IdUnidadeDestino).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.UsuarioEnvio).WithMany().HasForeignKey(t => t.IdUsuarioEnvio);
            e.HasOne(t => t.UsuarioRecebimento).WithMany().HasForeignKey(t => t.IdUsuarioRecebimento);
            e.HasIndex(t => new { t.IdUnidadeOrigem, t.IdUnidadeDestino, t.DataTransferencia });
            e.HasIndex(t => t.Status);
        });

        modelBuilder.Entity<TransferenciaEstoqueItemModel>(e =>
        {
            e.HasKey(i => i.Id);
            e.Property(i => i.Id).ValueGeneratedOnAdd();
            e.HasOne(i => i.Transferencia).WithMany(t => t.Itens).HasForeignKey(i => i.IdTransferencia);
            e.HasOne(i => i.Item).WithMany().HasForeignKey(i => i.IdItem);
        });

        modelBuilder.Entity<CodigoAcessoModel>()
            .HasData(new CodigoAcessoModel
            {
                Id = CodigoAcessoModel.IdRegistroUnico,
                Codigo = CodigoAcessoModel.CodigoPadrao,
                DataHoraAtualizacao = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EditadoPor = "Sistema"
            });
    }

    private static void AplicarConversoresUtc(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime))
                    property.SetValueConverter(new UtcDateTimeValueConverter());
                else if (property.ClrType == typeof(DateTime?))
                    property.SetValueConverter(new NullableUtcDateTimeValueConverter());
            }
        }
    }
}
