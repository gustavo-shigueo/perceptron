import { JSX, createEffect } from 'solid-js'
import { Network } from '../../perceptron/Network'
import { drawNetwork } from './drawNetwork'

export type NetworkCanvasProps = JSX.CanvasHTMLAttributes<HTMLCanvasElement> & {
	network: Network
}

export default function NetworkCanvas(props: NetworkCanvasProps) {
	let ref: HTMLCanvasElement | undefined

	createEffect(() => {
		if (!ref || !props.network) return

		console.log(props.network)
		drawNetwork(ref, props)
	})

	return <canvas ref={ref} class="w-full" width={1200} height={700} />
}
