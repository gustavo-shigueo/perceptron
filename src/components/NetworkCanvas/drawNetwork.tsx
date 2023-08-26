import { NetworkCanvasProps } from './NetworkCanvas'

export function drawNetwork(ref: HTMLCanvasElement, props: NetworkCanvasProps) {
	const width = ref.width * 0.9
	const height = ref.height * 0.9

	const inputs = props.network.inputs
	const weights = props.network.weights
	const biases = props.network.biases
	const outputs = props.network.outputs

	const ctx = ref.getContext('2d')!

	ctx.clearRect(0, 0, ref.width, ref.height)

	const maximumNeuronCount =
		Math.max(...weights.map(x => x.length), weights.at(-1)![0].length) + 1

	const radius = calculateRadius(height, maximumNeuronCount, width, weights)

	const [horizontalGap, verticalGap] = calculateGaps(
		width,
		weights,
		radius,
		height,
		maximumNeuronCount
	)

	let x = radius + (ref.width - width) / 2
	const neuronsLocationPerLayer: [number, number][][] = []

	for (let i = 0; i < weights.length; i++) {
		const neuronLocationsCurrentLayer: [number, number][] = []
		const numberOfNodes = weights[i].length

		let y =
			ref.height / 2 -
			radius * weights[i].length -
			(verticalGap * weights[i].length) / 2

		drawBias(ctx, x, y, radius, 'white')
		neuronLocationsCurrentLayer.push([x, y])
		y += radius * 2 + verticalGap

		drawNodes(
			numberOfNodes,
			ctx,
			x,
			y,
			radius,
			i,
			inputs,
			neuronLocationsCurrentLayer,
			verticalGap
		)

		neuronsLocationPerLayer.push(neuronLocationsCurrentLayer)
		x += horizontalGap + 2 * radius
	}

	drawOutputLayer(
		ref,
		x,
		weights.at(-1)![0].length,
		radius,
		verticalGap,
		ctx,
		outputs,
		neuronsLocationPerLayer
	)

	drawWeights(neuronsLocationPerLayer, ctx, radius, biases, weights)
}

function drawNodes(
	numberOfNodes: number,
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
	i: number,
	inputs: number[],
	neuronLocationsCurrentLayer: [number, number][],
	verticalGap: number
) {
	for (let j = 0; j < numberOfNodes; j++) {
		drawCircle(ctx, x, y, radius, 'white')

		if (i === 0) {
			renderInputs(radius, ctx, j, inputs, x, y)
		}

		neuronLocationsCurrentLayer.push([x, y])
		y += radius * 2 + verticalGap
	}
}

function drawOutputLayer(
	ref: HTMLCanvasElement,
	x: number,
	numberOfNodes: number,
	radius: number,
	verticalGap: number,
	ctx: CanvasRenderingContext2D,
	outputs: number[],
	neuronLocationPerLayer: number[][][]
) {
	let y =
		ref.height / 2 -
		radius * (numberOfNodes - 2) -
		(verticalGap * (numberOfNodes - 2)) / 2

	const lastLayer: [number, number][] = []

	for (let i = 0; i < numberOfNodes; i++) {
		drawCircle(ctx, x, y, radius, 'white')

		renderOutputs(radius, ctx, i, outputs, x, y)

		lastLayer.push([x, y])
		y += radius * 2 + verticalGap
	}

	neuronLocationPerLayer.push(lastLayer)
}

function drawWeights(
	neuronLocationPerLayer: [number, number][][],
	ctx: CanvasRenderingContext2D,
	radius: number,
	biases: number[][],
	weights: number[][][]
) {
	for (let i = 0; i < neuronLocationPerLayer.length - 1; i++) {
		const firstLayer = neuronLocationPerLayer[i]
		const secondLayer = neuronLocationPerLayer[i + 1]

		const [x0, y0] = firstLayer[0]

		const isLastLayer = i === neuronLocationPerLayer.length - 2

		for (let j = isLastLayer ? 0 : 1; j < secondLayer.length; j++) {
			const [x1, y1] = secondLayer[j]

			drawLine(
				ctx,
				x0 + radius,
				y0,
				x1 - radius,
				y1,
				biases[i][isLastLayer ? j : j - 1]
			)
		}

		for (let j = 1; j < firstLayer.length; j++) {
			const [x0, y0] = firstLayer[j]

			for (let k = isLastLayer ? 0 : 1; k < secondLayer.length; k++) {
				const [x1, y1] = secondLayer[k]

				drawLine(
					ctx,
					x0 + radius,
					y0,
					x1 - radius,
					y1,
					weights[i][j - 1][isLastLayer ? k : k - 1]
				)
			}
		}
	}
}

function renderOutputs(
	radius: number,
	ctx: CanvasRenderingContext2D,
	j: number,
	outputs: number[],
	x: number,
	y: number
) {
	const writeInNode = radius > 30
	ctx.fillStyle = writeInNode ? '#000000' : '#AFAFAF'
	ctx.textAlign = writeInNode ? 'center' : 'start'
	ctx.textBaseline = 'middle'
	ctx.font = 'bold 10pt arial'
	ctx.fillText(
		`y${j}: ${outputs[j].toFixed(4)}`,
		writeInNode ? x : x + radius + 5,
		y
	)
}

function renderInputs(
	radius: number,
	ctx: CanvasRenderingContext2D,
	j: number,
	inputs: number[],
	x: number,
	y: number
) {
	const writeInNode = radius > 30

	ctx.fillStyle = writeInNode ? '#000000' : '#AFAFAF'
	ctx.textAlign = writeInNode ? 'center' : 'end'
	ctx.textBaseline = 'middle'
	ctx.font = 'bold 10pt arial'
	ctx.fillText(
		`x${j}: ${inputs[j].toFixed(2)}`,
		writeInNode ? x : x - radius - 5,
		y
	)
}

function calculateRadius(
	height: number,
	maximumNeuronCount: number,
	width: number,
	weights: number[][][]
) {
	const neuronSize =
		Math.min(height / maximumNeuronCount, width / (weights.length + 1)) - 50
	const radius = neuronSize / 2
	return radius
}

function calculateGaps(
	width: number,
	weights: number[][][],
	radius: number,
	height: number,
	maximumNeuronCount: number
): [number, number] {
	return [
		(width - (weights.length + 1) * radius * 2) / weights.length,
		(height - maximumNeuronCount * radius * 2) / maximumNeuronCount,
	]
}

function drawCircle(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	radius: number,
	color: string
) {
	ctx.beginPath()
	ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
	ctx.fillStyle = color
	ctx.fill()
	ctx.lineWidth = radius / 20
	ctx.strokeStyle = '#000000'
	ctx.stroke()
}

function drawBias(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	color: string
) {
	ctx.beginPath()
	ctx.rect(x - size, y - size, 2 * size, 2 * size)
	ctx.fillStyle = color
	ctx.fill()
	ctx.lineWidth = size / 20
	ctx.strokeStyle = '#000000'
	ctx.fillStyle = '#000000'
	ctx.textBaseline = 'middle'
	ctx.textAlign = 'center'
	ctx.font = 'bold 12pt arial'
	ctx.fillText('Bias: 1', x, y)
	ctx.stroke()
}

function drawLine(
	ctx: CanvasRenderingContext2D,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	weight: number
) {
	if (weight === undefined) throw new Error()
	ctx.beginPath()
	ctx.moveTo(x1, y1)
	ctx.lineTo(x2, y2)

	const color = weight > 0 ? 'blue' : 'red'

	const lineWidth = ctx.lineWidth
	ctx.lineWidth = 5 * Math.min(Math.abs(weight), 1)

	ctx.strokeStyle = `${color}`
	ctx.stroke()
	ctx.lineWidth = lineWidth
}
