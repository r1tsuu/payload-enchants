import { useState } from 'react'

interface UseDisclosure {
  defaultIsOpen?: boolean
}

export const useDisclosure = ({ defaultIsOpen = false }: UseDisclosure = {}) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onToggle = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  }
}
