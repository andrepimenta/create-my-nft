import React, { ReactElement } from 'react'
import { Modal } from 'semantic-ui-react'

interface Props {
  title: string;
  content: ReactElement;
  buttons: ReactElement
  open: boolean
  setOpen: (open: boolean) => void;
}


function CustomModal({title, content, buttons, open, setOpen} : Props) {
  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content image>
        {content}
      </Modal.Content>
      <Modal.Actions>
        {buttons}
      </Modal.Actions>
    </Modal>
  )
}

export default CustomModal