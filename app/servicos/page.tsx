'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'

export default function Servicos() {
  const [barbearia, setBarbearia] = useState<any>(null)
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [duracao, setDuracao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('barbearias')
        .select('id, nome')
        .eq('user_id', user.id)
        .single()

      setBarbearia(data)
      setCarregando(false)
    }
    carregar()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMensagem('Cadastrando...')

    const { error } = await supabase.from('servicos').insert({
      barbearia_id: barbearia.id,
      nome,
      preco: parseFloat(preco),
      duracao_minutos: parseInt(duracao),
    })

    if (error) {
      setMensagem('Erro ao cadastrar: ' + error.message)
    } else {
      setMensagem('Serviço cadastrado com sucesso!')
      setNome('')
      setPreco('')
      setDuracao('')
    }
  }

  if (carregando) return <div className="pagina"><p className="subtitulo">Carregando...</p></div>

  return (
    <div className="pagina">
      <div className="painel">
        <h1 className="titulo fonte-destaque">Cadastrar Serviço</h1>
        <p className="subtitulo">{barbearia?.nome}</p>
        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label className="rotulo">Nome do serviço</label>
            <input className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: Corte de cabelo" />
          </div>
          <div className="campo">
            <label className="rotulo">Preço (R$)</label>
            <input className="entrada" type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} required />
          </div>
          <div className="campo">
            <label className="rotulo">Duração (minutos)</label>
            <input className="entrada" type="number" value={duracao} onChange={(e) => setDuracao(e.target.value)} required />
          </div>
          <button type="submit" className="botao">Cadastrar</button>
        </form>
        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  )
}