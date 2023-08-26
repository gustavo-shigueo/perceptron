import { ActivationFunction } from './ActivationFunction'
import { DataPoint } from './DataPoint'
import { Layer } from './Layer'

export class Network {
	#layers: Layer[]
	#learnRate: number
	#activationFunctionDerivative: ActivationFunction
	#activationFunction: ActivationFunction

	public constructor(
		layerSizes: number[],
		learnRate: number,
		activationFunction: ActivationFunction,
		activationFunctionDerivative: ActivationFunction
	) {
		this.#layers = new Array(layerSizes.length - 1)
		this.#learnRate = learnRate
		this.#activationFunction = activationFunction
		this.#activationFunctionDerivative = activationFunctionDerivative

		for (let i = 0; i < this.#layers.length; i++) {
			this.#layers[i] = new Layer(
				layerSizes[i],
				layerSizes[i + 1],
				activationFunction
			)
		}
	}

	public input(data: number[]) {
		let outputs = this.#layers[0].forward(data)

		for (let i = 1; i < this.#layers.length; i++) {
			outputs = this.#layers[i].forward(outputs)
		}

		return outputs
	}

	public clone() {
		const newNetwork = new Network(
			this.#layers.map(x => x.inputs.length),
			this.#learnRate,
			this.#activationFunction,
			this.#activationFunctionDerivative
		)

		newNetwork.#layers = this.#layers

		return newNetwork
	}

	#nodeCostDerivative(expected: number, actual: number) {
		return 2 * (actual - expected)
	}

	#outputLayerNodeValues(expectedOutput: number[]) {
		const outputLayer = this.#layers.at(-1)!
		const nodeValues: number[] = new Array(expectedOutput.length)

		for (let i = 0; i < nodeValues.length; i++) {
			const costDerivative = this.#nodeCostDerivative(
				expectedOutput[i],
				outputLayer.outputs[i]
			)
			const activationDerivative = this.#activationFunctionDerivative(
				outputLayer.weightedInputs[i]
			)

			nodeValues[i] = costDerivative * activationDerivative
		}

		return nodeValues
	}

	#hiddenLayerNodeValues(
		layer: Layer,
		nextLayer: Layer,
		nextLayerNodeValues: number[]
	) {
		const nodeValues: number[] = new Array(layer.outputs.length).fill(0)

		for (let i = 0; i < nodeValues.length; i++) {
			for (let j = 0; j < nextLayerNodeValues.length; j++) {
				const weightedInputDerivative = nextLayer.weights[i][j]
				nodeValues[i] += weightedInputDerivative * nextLayerNodeValues[j]
			}

			nodeValues[i] *= this.#activationFunctionDerivative(
				layer.weightedInputs[i]
			)
		}

		return nodeValues
	}

	#updateAllGradients(dataPoint: DataPoint) {
		this.input(dataPoint.input)
		const outputLayer = this.#layers.at(-1)!

		let nodeValues = this.#outputLayerNodeValues(dataPoint.expectedOutput)
		outputLayer.updateGradients(nodeValues)

		for (let i = this.#layers.length - 2; i >= 0; i--) {
			const layer = this.#layers[i]
			nodeValues = this.#hiddenLayerNodeValues(
				layer,
				this.#layers[i + 1],
				nodeValues
			)

			layer.updateGradients(nodeValues)
		}
	}

	public learn(dataPoints: DataPoint[]) {
		for (const dataPoint of dataPoints) {
			this.#updateAllGradients(dataPoint)
		}

		for (let i = 0; i < this.#layers.length; i++) {
			const layer = this.#layers[i]

			for (let j = 0; j < layer.biases.length; j++) {
				layer.biases[j] -= this.#learnRate * layer.biasCostGradients[j]
				layer.biasCostGradients[j] = 0

				for (let k = 0; k < layer.weights.length; k++) {
					const deltaWeight = this.#learnRate * layer.weightCostGradients[k][j]

					layer.weights[k][j] -= deltaWeight
					layer.weightCostGradients[k][j] = 0
				}
			}
		}

		this.input(dataPoints[0].input.fill(0))
	}

	public get weights() {
		return this.#layers.map(layer => layer.weights)
	}

	public get biases() {
		return this.#layers.map(layer => layer.biases)
	}

	public get inputs() {
		return this.#layers[0].inputs
	}

	public get outputs() {
		return this.#layers.at(-1)!.outputs
	}
}
