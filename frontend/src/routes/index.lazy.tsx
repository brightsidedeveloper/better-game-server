import { createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { WebSocketMessage } from '../websocket'

export const Route = createLazyFileRoute('/')({
  component: RouteComponent,
})

const WEBSOCKET = 'ws://localhost:8080/ws'

function RouteComponent() {
  const socket = useSocket()

  const test = () => {
    const msg = WebSocketMessage.create({
      textMessage: {
        content: 'Hello, server!',
      },
    })

    const buffer = WebSocketMessage.encode(msg).finish()
    console.log(buffer)
    socket?.send(buffer)
  }

  return <button onClick={test}>Test</button>
}

function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(WEBSOCKET)

    socket.onopen = () => {
      console.log('connected')
    }

    socket.onclose = () => {
      console.log('disconnected')
    }

    socket.onmessage = async (event) => {
      const data = event.data

      if (data instanceof Blob) {
        // Convert Blob to ArrayBuffer
        const arrayBuffer = await data.arrayBuffer()

        // Decode Protobuf message
        const message = WebSocketMessage.decode(new Uint8Array(arrayBuffer))

        // Access typed fields
        if (message.textMessage) {
          console.log('TextMessage:', message.textMessage.content)
        } else if (message.gameInvite) {
          console.log('GameInvite:', message.gameInvite.gameId)
        } else if (message.userAction) {
          console.log('UserAction:', message.userAction.action)
        } else {
          console.log('Unknown message type:', message)
        }
      } else {
        console.error('Unexpected message format:', data)
      }
    }

    setSocket(socket)
    return () => {
      socket.close()
    }
  }, [])

  return socket
}