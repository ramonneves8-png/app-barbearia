import Link from 'next/link'

export default function Home() {
  return (
    <div className="pagina">
      <div className="painel" style={{ textAlign: 'center' }}>
        <h1 className="titulo fonte-destaque">Sistema de Agendamento para Barbearias</h1>
        <p className="subtitulo">Gerencie sua barbearia e deixe seus clientes agendarem online</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <Link href="/cadastro" className="botao" style={{ textDecoration: 'none', display: 'block' }}>
            Cadastrar minha barbearia
          </Link>
          <Link href="/login" style={{ color: 'var(--cor-dourado)', textDecoration: 'none' }}>
            Já tenho conta — Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}