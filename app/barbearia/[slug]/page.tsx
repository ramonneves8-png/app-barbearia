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

    const { error } = await supabase.from('agendamentos').insert({