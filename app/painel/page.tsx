'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'

type Agendamento = {
  id: string
  cliente_nome: string
  cliente_telefone: string
  data_hora: string
  status: string
  servicos: { nome: string } | null
}

export default function Painel() {
  const [barbearia, setBarbearia] = useState<any>(null)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: barbeariaData } = await supabase
        .from('barbearias')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setBarbearia(barbeariaData)

      if (barbeariaData) {
        const { data } = await supabase
          .from('agendamentos')
          .select('id, cliente_nome, cliente_telefone, data_hora, status, servicos(nome)')
          .eq('barbearia_id', barbeariaData.id)
          .order('data_hora', { ascending: true })

        if (data) setAgendamentos(data as any)
      } else {
        setMensagem('Nenhuma barbearia encontrada para esta conta.')
      }

      setCarregando(false)
    }
    carregar()
  }, [])

  function formatarData(data: string) {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (carregando) return <div className="pagina"><p className="subtitulo">Carregando...</p></div>

  return (
    <div className="pagina">
      <div className="painel" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="titulo fonte-destaque">{barbearia?.nome ?? 'Painel'}</h1>
            <p className="subtitulo">Agendamentos recebidos</p>
          </div>
          <button onClick={handleLogout} className="botao" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}>
            Sair
          </button>
        </div>

        {mensagem && <p className="mensagem">{mensagem}</p>}

        {barbearia && agendamentos.length === 0 && (
          <p className="mensagem">Nenhum agendamento ainda.</p>
        )}

        {agendamentos.map((a) => (
          <div key={a.id} style={{ borderTop: '1px solid var(--cor-borda)', padding: '14px 0' }}>
            <strong>{a.cliente_nome}</strong> — {a.servicos?.nome ?? 'Serviço'}<br />
            <span className="subtitulo" style={{ marginBottom: 0 }}>
              {formatarData(a.data_hora)} · {a.cliente_telefone}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}