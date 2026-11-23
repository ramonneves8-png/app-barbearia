'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../utils/supabase/client'

const LINK_ASSINATURA = 'meu-link-aqui'

type Agendamento = {
  id: string
  cliente_nome: string
  cliente_telefone: string
  data_hora: string
  status: string
  servicos: { nome: string } | null
}

type Servico = {
  id: string
  nome: string
  preco: number
  duracao_minutos: number
}

export default function Painel() {
  const [aba, setAba] = useState<'agendamentos' | 'servicos'>('agendamentos')
  const [barbearia, setBarbearia] = useState<any>(null)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')

  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [duracao, setDuracao] = useState('')
  const [mensagemServico, setMensagemServico] = useState('')

  const supabase = createClient()
  const router = useRouter()

  async function carregarTudo(barbeariaId: string) {
    const { data: agData } = await supabase
      .from('agendamentos')
      .select('id, cliente_nome, cliente_telefone, data_hora, status, servicos(nome)')
      .eq('barbearia_id', barbeariaId)
      .order('data_hora', { ascending: true })
    if (agData) setAgendamentos(agData as any)

    const { data: servData } = await supabase
      .from('servicos')
      .select('*')
      .eq('barbearia_id', barbeariaId)
    if (servData) setServicos(servData)
  }

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
        await carregarTudo(barbeariaData.id)
      } else {
        setMensagem('Nenhuma barbearia encontrada para esta conta.')
      }

      setCarregando(false)
    }
    carregar()
  }, [])

  async function handleSubmitServico(e: React.FormEvent) {
    e.preventDefault()
    setMensagemServico('Cadastrando...')

    const { error } = await supabase.from('servicos').insert({
      barbearia_id: barbearia.id,
      nome,
      preco: parseFloat(preco),
      duracao_minutos: parseInt(duracao),
    })

    if (error) {
      setMensagemServico('Erro ao cadastrar: ' + error.message)
    } else {
      setMensagemServico('Serviço cadastrado com sucesso!')
      setNome('')
      setPreco('')
      setDuracao('')
      await carregarTudo(barbearia.id)
    }
  }

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
          </div>
          <button onClick={handleLogout} className="botao" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}>
            Sair
          </button>
        </div>

        {mensagem && <p className="mensagem">{mensagem}</p>}

        {barbearia && !barbearia.assinatura_ativa && (
          <div style={{ marginTop: 20, padding: 20, border: '1px solid var(--cor-dourado)', textAlign: 'center' }}>
            <p style={{ marginBottom: 12 }}>
              Sua assinatura ainda não está ativa. Assine para liberar o painel completo.
            </p>
            <a
              href={LINK_ASSINATURA}
              target="_blank"
              rel="noopener noreferrer"
              className="botao"
              style={{ textDecoration: 'none', display: 'inline-block', width: 'auto', padding: '10px 24px' }}
            >
              Assinar agora
            </a>
          </div>
        )}

        {barbearia && barbearia.assinatura_ativa && (
          <>
            <div style={{ display: 'flex', gap: 8, margin: '20px 0', borderBottom: '1px solid var(--cor-borda)' }}>
              <button
                onClick={() => setAba('agendamentos')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 4px', color: aba === 'agendamentos' ? 'var(--cor-dourado)' : 'var(--cor-texto-suave)',
                  borderBottom: aba === 'agendamentos' ? '2px solid var(--cor-dourado)' : '2px solid transparent',
                  fontSize: '0.95rem',
                }}
              >
                Agendamentos
              </button>
              <button
                onClick={() => setAba('servicos')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '8px 4px', color: aba === 'servicos' ? 'var(--cor-dourado)' : 'var(--cor-texto-suave)',
                  borderBottom: aba === 'servicos' ? '2px solid var(--cor-dourado)' : '2px solid transparent',
                  fontSize: '0.95rem',
                }}
              >
                Serviços
              </button>
            </div>

            {aba === 'agendamentos' && (
              <div>
                {agendamentos.length === 0 && <p className="mensagem">Nenhum agendamento ainda.</p>}
                {agendamentos.map((a) => (
                  <div key={a.id} style={{ borderTop: '1px solid var(--cor-borda)', padding: '14px 0' }}>
                    <strong>{a.cliente_nome}</strong> — {a.servicos?.nome ?? 'Serviço'}<br />
                    <span className="subtitulo" style={{ marginBottom: 0 }}>
                      {formatarData(a.data_hora)} · {a.cliente_telefone}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {aba === 'servicos' && (
              <div>
                {servicos.map((s) => (
                  <div key={s.id} style={{ borderTop: '1px solid var(--cor-borda)', padding: '12px 0' }}>
                    <strong>{s.nome}</strong> — R$ {s.preco} ({s.duracao_minutos} min)
                  </div>
                ))}

                <h2 className="fonte-destaque" style={{ fontSize: '1.3rem', marginTop: 20, marginBottom: 12 }}>
                  Adicionar serviço
                </h2>
                <form onSubmit={handleSubmitServico}>
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
                {mensagemServico && <p className="mensagem">{mensagemServico}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}