import { Navigate, Route, Routes } from 'react-router-dom';
import { LeiautePrincipal } from '../../shared/components/LeiautePrincipal';
import { RotaProtegida } from '../../shared/components/RotaProtegida';
import { RotaProtegidaPorPapel } from '../../shared/components/RotaProtegidaPorPapel';
import { PaginaAcessoNegado } from '../../shared/pages/PaginaAcessoNegado';
import { PaginaDetalheSessao } from '../../domains/autenticacao/pages/PaginaDetalheSessao';
import { PaginaLogin } from '../../domains/autenticacao/pages/PaginaLogin';
import { PaginaCadastroUsuario } from '../../domains/usuarios/pages/PaginaCadastroUsuario';
import { PaginaListagemUsuarios } from '../../domains/usuarios/pages/PaginaListagemUsuarios';
import { PaginaPerfilUsuario } from '../../domains/usuarios/pages/PaginaPerfilUsuario';
import { PaginaDetalheProduto } from '../../domains/produtos/pages/PaginaDetalheProduto';
import { PaginaFormularioProduto } from '../../domains/produtos/pages/PaginaFormularioProduto';
import { PaginaListagemProdutos } from '../../domains/produtos/pages/PaginaListagemProdutos';
import { PaginaDetalheMedicamento } from '../../domains/medicamentos/pages/PaginaDetalheMedicamento';
import { PaginaFormularioMedicamento } from '../../domains/medicamentos/pages/PaginaFormularioMedicamento';
import { PaginaListagemMedicamentos } from '../../domains/medicamentos/pages/PaginaListagemMedicamentos';
import { PaginaDetalheInsumo } from '../../domains/insumos/pages/PaginaDetalheInsumo';
import { PaginaFormularioInsumo } from '../../domains/insumos/pages/PaginaFormularioInsumo';
import { PaginaListagemInsumos } from '../../domains/insumos/pages/PaginaListagemInsumos';
import { PaginaDetalheItemEstoque } from '../../domains/estoque/pages/PaginaDetalheItemEstoque';
import { PaginaFormularioLote } from '../../domains/estoque/pages/PaginaFormularioLote';
import { PaginaFormularioRetirada } from '../../domains/estoque/pages/PaginaFormularioRetirada';
import { PaginaListagemEstoque } from '../../domains/estoque/pages/PaginaListagemEstoque';
import { DashboardPage } from '../../domains/estoque/pages/DashboardPage';

export function RotasApp() {
  return (
    <Routes>
      <Route path="/" element={<LeiautePrincipal />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="login" element={<PaginaLogin />} />
        <Route path="cadastro" element={<PaginaCadastroUsuario />} />
        <Route path="403" element={<PaginaAcessoNegado />} />

        <Route element={<RotaProtegida />}>
          <Route path="sessao" element={<PaginaDetalheSessao />} />
          <Route path="perfil" element={<PaginaPerfilUsuario />} />

          <Route element={<RotaProtegidaPorPapel roles={['ADMIN']} />}>
            <Route path="usuarios" element={<PaginaListagemUsuarios />} />
            <Route path="usuarios/novo" element={<PaginaCadastroUsuario />} />
          </Route>

          <Route path="produtos" element={<PaginaListagemProdutos />} />
          <Route path="produtos/novo" element={<PaginaFormularioProduto />} />
          <Route path="produtos/:id" element={<PaginaDetalheProduto />} />

          <Route path="medicamentos" element={<PaginaListagemMedicamentos />} />
          <Route path="medicamentos/novo" element={<PaginaFormularioMedicamento />} />
          <Route path="medicamentos/:id" element={<PaginaDetalheMedicamento />} />

          <Route path="insumos" element={<PaginaListagemInsumos />} />
          <Route path="insumos/novo" element={<PaginaFormularioInsumo />} />
          <Route path="insumos/:id" element={<PaginaDetalheInsumo />} />

          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="estoque" element={<PaginaListagemEstoque />} />
          <Route path="estoque/item/:id" element={<PaginaDetalheItemEstoque />} />
          <Route path="estoque/lotes/novo" element={<PaginaFormularioLote />} />
          <Route path="estoque/retirada" element={<PaginaFormularioRetirada />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
