'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')

  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMensagem('Entrando...')

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setMensagem('E-mail ou senha incorretos.')
    } else {
      router.push('/painel')
    }
  }

  return (
    <div className="pagina">
      <div className="painel">
        <h1 className="titulo fonte-destaque">Entrar</h1>
        <p className="subtitulo">Acesse o painel da sua barbearia</p>
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label className="rotulo">E-mail</label>
            <input className="entrada" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="campo">
            <label className="rotulo">Senha</label>
            <input className="entrada" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          <button type="submit" className="botao">Entrar</button>
        </form>
        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  )
}