/**
 * Attention: this is just an example, we didn't use any library to control our form. Feel free to use
 * the library of your choice or no library at all.
 */

import { cancel, contentClient, getData, submit, workspaceClient, workspaceManagerClient } from '@stack-spot/portal-extension'
import { useEffect, useState } from 'react'
import { useTranslate } from '@stack-spot/portal-translate'
import { onChangeData } from '@stack-spot/portal-extension'
import { useCurrentPage, useUserData } from '@stack-spot/portal-extension/dist/portal-data'
import { Column, Text, Button, Card, Select, AsyncContent, Input, FormGroup, Form, Row, ButtonGroup } from '@stack-spot/citric-react'
import { dictionary } from './dictionary'

interface Field<T> {
  dirty?: boolean,
  error?: string,
  value?: T,
}

interface FormData {
  name: Field<string>,
  document: Field<string>,
  gender: Field<'m' | 'f' | 'nb' | ''>,
  birth: Field<string>,
  phone: Field<string>,
  email: Field<string>,
}

function validate(name: keyof FormData, value: string) {
  // required
  if (['name', 'document', 'email'].includes(name) && !value) {
    return 'required'
  }
  // email validation
  if (name === 'email' && !value.match(/\w+@\w+/)) {
    return 'invalidEmail'
  }
}

const genderOptions = ['m', 'f', 'nb']

export const MyForm = () => {
  const t = useTranslate(dictionary)
  const page = useCurrentPage()
  const { name, email } = useUserData() ?? {}
  const [selectedVariable, setSelectedVariable] = useState<{ name: string, value?: any } | undefined>(undefined)
  const [stack, isLoadingStack, stackError] = contentClient.getStackByVersionId.useStatefulQuery(
    { stackVersionId: page?.params.stackVersionId },
    { enabled: !!page?.params.stackVersionId },
  )
  const [workspace, isLoadingWorkspace, workspaceError] = workspaceClient.workspace.useStatefulQuery(
    { workspaceId: page?.params.workspaceId },
    { enabled: !!page?.params.workspaceId },
  )
  const [accountVars, isLoadingAccountVars, accountVarsError] = workspaceManagerClient.accountVariables.useStatefulQuery({ size: 1000 })
  const [workspaceVars, isLoadingWorkspaceVars, workspaceVarsError] = workspaceManagerClient.workspaceVariables.useStatefulQuery(
    { workspaceId: page?.params.workspaceId, size: 1000 },
    { enabled: !!page?.params.workspaceId },
  )
  const [form, setForm] = useState<FormData>({
    name: {},
    document: {},
    gender: {},
    birth: {},
    phone: {},
    email: {},
  })

  function updateForm(data: Record<string, any>) {
    setForm({
      name: { value: data.name },
      document: { value: data.document },
      gender: { value: data.gender },
      birth: { value: data.birth },
      phone: { value: data.phone },
      email: { value: data.email },
    })
  }

  useEffect(() => {
    updateForm(getData())
    return onChangeData(updateForm)
  }, [])

  function change(name: keyof FormData) {
    return (value: string | undefined = '') => {
      const error = form[name].dirty ? validate(name, value) : undefined
      setForm({ ...form, [name]: { ...form[name], value, error }})
    }
  }

  function blur(name: keyof FormData) {
    return (e: React.ChangeEvent) => {
      const value = 'value' in e.target ? e.target.value as string : ''
      const error = validate(name, value)
      setForm({ ...form, [name]: { dirty: true, value, error }})
    }
  }

  function validateAll() {
    const keys = Object.keys(form)
    const result: Record<string, Field<string>> = {}
    let isValid = true
    for (const key of keys) {
      const k = key as keyof FormData
      const error = validate(k, form[k].value ?? '')
      if (error) isValid = false
      result[k] = { ...form[k], error, dirty: true }
    }
    setForm(result as unknown as FormData)
    return isValid
  }

  function onSubmit() {
    if (validateAll()) {
      submit({
        name: form.name.value,
        document: form.document.value,
        gender: form.gender.value,
        birth: form.birth.value,
        phone: form.phone.value,
        email: form.email.value,
      })
    }
  }

  function getError(key: string | undefined) {
    return (t as Record<string, string>)[key ?? ''] || key
  }

  return (
    <Column gap="16px">
      <Text appearance="h2">Extension Form</Text>
      <Card style={{ gap: '10px' }}>
        <Text appearance="h4">User data:</Text>
        <Text>Name: {name}</Text>
        <Text>Email: {email}</Text>
      </Card>
      <Card style={{ gap: '10px' }}>
        <Text appearance="h4">Stack</Text>
        <AsyncContent loading={isLoadingStack} error={stackError}>
          {stack && <>
            {stack.stack.imageUrl && <img src={stack.stack.imageUrl} width="32px" height="32px" />}
            <Text>Name: {stack.stack.displayName}</Text>
            <Text>Created at: {new Date(stack.stack.createdAt).toString()}</Text>
            <Text>Created by: {stack.stack.createdBy}</Text>
            <Text>Description: {stack.stack.description}</Text>
          </>}
        </AsyncContent>
      </Card>
      <Card style={{ gap: '10px' }}>
        <Text appearance="h4">Workspace</Text>
        <AsyncContent loading={isLoadingWorkspace} error={workspaceError}>
          {workspace && <>
            {workspace.imageUrl && <img src={workspace.imageUrl} width="32px" height="32px" />}
            <Text>Name: {workspace.name}</Text>
            <Text>Created at: {new Date(workspace.createdAt).toString()}</Text>
            <Text>Created by: {workspace.createdBy}</Text>
            <Text>Description: {workspace.description}</Text>
          </>}
        </AsyncContent>
      </Card>
      <Card style={{ gap: '10px' }}>
        <Text appearance="h4">Context variables</Text>
        <AsyncContent loading={isLoadingWorkspaceVars || isLoadingAccountVars} error={workspaceVarsError ?? accountVarsError}>
          {workspaceVars && accountVars && <>
            <FormGroup label="Select a variable and see its value">
              <Select
                required={false}
                options={[...accountVars.items, ...workspaceVars.items]}
                value={selectedVariable}
                onChange={setSelectedVariable}
                renderKey={o => o.name}
                renderLabel={o => o.name}
                style={{ width: '100%' }}
              />
            </FormGroup>
            <Text>Value: {selectedVariable?.value}</Text>
          </>}
        </AsyncContent>
      </Card>
      <Form>
        <FormGroup label="Name" error={getError(form.name.error)}>
          <Input value={form.name.value} onChange={change('name')} onBlur={blur('name')} />
        </FormGroup>

        <FormGroup label="Document" error={getError(form.document.error)}>
          <Input value={form.document.value} onChange={change('document')} onBlur={blur('document')} />
        </FormGroup>

        <Row>
          <FormGroup label="Gender" error={getError(form.gender.error)}>
            <Select
              options={genderOptions}
              required={false}
              value={form.gender.value}
              onChange={change('gender')}
              renderLabel={o => (t as any)[`gender.${o}`]}
              style={{ width: '100%' }}
            />
          </FormGroup>
          <FormGroup label="Birth date" error={getError(form.birth.error)}>
            <Input value={form.birth.value} onChange={change('birth')} onBlur={blur('birth')} type="date" />
          </FormGroup>
          <FormGroup label="Phone number" error={getError(form.phone.error)}>
            <Input value={form.phone.value} onChange={change('phone')} onBlur={blur('phone')} />
          </FormGroup>
        </Row>

        <FormGroup label="email" error={getError(form.email.error)}>
          <Input value={form.email.value} onChange={change('email')} onBlur={blur('email')} type="email" />
        </FormGroup>

        <ButtonGroup>
          <Button colorScheme="inverse" appearance="outlined" onClick={cancel}>{t.previous}</Button>
          <Button onClick={onSubmit}>{t.next}</Button>
        </ButtonGroup>
      </Form>
    </Column>
  )
}
