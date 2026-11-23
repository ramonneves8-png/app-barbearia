'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')

  const supabase = createClient()
  const router = useRouter()

  function gerarSlug(texto: string) {
    return texto
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMensagem('Cadastrando...')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (authError || !authData.user) {
      setMensagem('Erro ao criar conta: ' + authError?.message)
      return
    }

    const slug = gerarSlug(nome)

    const { error } = await supabase.from('barbearias').insert({
      nome,
      email,
      telefone,
      slug,
      user_id: authData.user.id,
    })

    if (error) {
      setMensagem('Erro ao cadastrar barbearia: ' + error.message)
    } else {
      setMensagem('Cadastro feito com sucesso! Redirecionando...')
      setTimeout(() => router.push('/painel'), 1500)
    }
  }

  return (
    <div className="pagina">
      <div className="painel">
        <h1 className="titulo fonte-destaque">Cadastrar Barbearia</h1>
        <p className="subtitulo">Crie sua conta para começar a usar o sistema</p>
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label className="rotulo">Nome da barbearia</label>
            <input className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="campo">
            <label className="rotulo">E-mail</label>
            <input className="entrada" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="campo">
            <label className="rotulo">Telefone</label>
            <input className="entrada" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
          <div className="campo">
            <label className="rotulo">Senha</label>
            <input className="entrada" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="botao">Cadastrar</button>
        </form>
        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  )
}