import { Button, Column, FieldGroup, IconBox, IconButton, Input, Row, Text, Tooltip } from '@stack-spot/citric-react'
import { cancel, getData, onChangeData, showToaster, StackspotExtension, submit } from '@stack-spot/portal-extension'
import { useCallback, useEffect, useState } from 'react'

export const App = () => {
  const [isLoading, setLoading] = useState(false)
  const [pin, setPin] = useState('')

  useEffect(() => {
    setPin(getData().pin)
    onChangeData(data => setPin(data.pin))
  }, [])

  const generatePin = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('https://lucas-moraes-stk.app.n8n.cloud/webhook/extension-widget-stk-demo', { method: 'post' })
      if (!response.ok) throw new Error(`Error while generating pin: ${response.status}.\n${await response.text()}`)
      const { pin } = await response.json()
      if (!pin) throw new Error ('Unexpected response format from the backend')
      setPin(pin)
    } catch (error) {
      console.error(error)
      showToaster({ type: 'error', message: 'Unable to generate pin. Try again later.' })
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <StackspotExtension>
      <Column gap="20px">
        <Text appearance="h2">Gerador de Pin</Text>
        <FieldGroup style={{ width: 'auto' }}>
          <IconBox icon="Lock" />
          <Input placeholder="Use o botão abaixo para gerar um pin" value={pin} disabled style={{ flex: 1 }} />
          <Tooltip content="Copiar" position="left">
            <IconButton icon="Copy" feedback="Copiado!" onClick={() => navigator.clipboard.writeText(pin)} />
          </Tooltip>
        </FieldGroup>
        <Button onClick={generatePin} loading={isLoading}>Gerar Pin</Button>
        <Row justifyContent="space-between">
          <Button colorScheme="inverse" appearance="outlined" onClick={cancel}>Anterior</Button>
          <Button onClick={() => submit({ pin })} disabled={!pin}>Próximo</Button>
        </Row>
      </Column>
    </StackspotExtension>
  )
}
