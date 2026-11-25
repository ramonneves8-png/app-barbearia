'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '../../../utils/supabase/client'

type Servico = { id: string; nome: string; preco: number; duracao_minutos: number }

export default function PaginaBarbearia() {
  const params = useParams()
  const slug = params.slug as string

  const [barbearia, setBarbearia] = useState<any>(null)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [servicoId, setServicoId] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data: barbeariaData } = await supabase
        .from('barbearias')
        .select('*')
        .eq('slug', slug)
        .single()

      setBarbearia(barbeariaData)

      if (barbeariaData) {
        const { data: servicosData } = await supabase
          .from('servicos')
          .select('*')
          .eq('barbearia_id', barbeariaData.id)

        if (servicosData) setServicos(servicosData)
      }
      setCarregando(false)
    }
    if (slug) carregar()
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMensagem('Agendando...')

    const [dataParte, horaParte] = dataHora.split('T')
const [ano, mes, dia] = dataParte.split('-').map(Number)
const [hora, minuto] = horaParte.split(':').map(Number)
const dataLocal = new Date(ano, mes - 1, dia, hora, minuto)

    const { error } = await supabase.from('agendamentos').insert({
      barbearia_id: barbearia.id,
      servico_id: servicoId,
      cliente_nome: clienteNome,
      cliente_telefone: clienteTelefone,
     data_hora: new Date(dataHora).toISOString(),
    })

    if (error) {
      setMensagem('Erro ao agendar: ' + error.message)
    } else {
      setMensagem('Agendamento confirmado! Te esperamos lá.')
      setClienteNome('')
      setClienteTelefone('')
      setDataHora('')
      setServicoId('')
    }
  }

  if (carregando) return <div className="pagina"><p className="subtitulo">Carregando...</p></div>
  if (!barbearia) return <div className="pagina"><p className="subtitulo">Barbearia não encontrada.</p></div>

  return (
    <div className="pagina">
      <div className="painel">
        <h1 className="titulo fonte-destaque">{barbearia.nome}</h1>
        <p className="subtitulo">Agende seu horário abaixo</p>

        <form onSubmit={handleSubmit}>
          <div className="campo">
            <label className="rotulo">Serviço</label>
            <select className="entrada" value={servicoId} onChange={(e) => setServicoId(e.target.value)} required>
              <option value="">Selecione...</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — R$ {s.preco} ({s.duracao_minutos} min)
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label className="rotulo">Seu nome</label>
            <input className="entrada" value={clienteNome} onChange={(e) => setClienteNome(e.target.value)} required />
          </div>

          <div className="campo">
            <label className="rotulo">Seu telefone</label>
            <input className="entrada" value={clienteTelefone} onChange={(e) => setClienteTelefone(e.target.value)} required />
          </div>

          <div className="campo">
            <label className="rotulo">Data e hora</label>
            <input className="entrada" type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} required />
          </div>

          <button type="submit" className="botao">Agendar</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    </div>
  )
}