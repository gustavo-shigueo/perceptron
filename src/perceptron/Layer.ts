import { ActivationFunction } from './ActivationFunction'

export class Layer {
	public weightedInputs: number[]
	public inputs: number[]
	public outputs: number[]
	public biases: number[]
	public weights: number[][]

	public weightCostGradients: number[][]
	public biasCostGradients: number[]

	#activationFunction: ActivationFunction

	public constructor(
		inputCount: number,
		outputCount: number,
		activationFunction: ActivationFunction
	) {
		this.inputs = new Array(inputCount).fill(0)
		this.weightedInputs = new Array(outputCount).fill(0)
		this.outputs = new Array(outputCount).fill(0)
		this.biases = new Array(outputCount).fill(0)
		this.biasCostGradients = new Array(outputCount).fill(0)
		this.#activationFunction = activationFunction

		this.weights = new Array(inputCount)
		this.weightCostGradients = new Array(inputCount)
		for (let i = 0; i < inputCount; i++) {
			this.weights[i] = new Array(outputCount).fill(0)
			this.weightCostGradients[i] = new Array(outputCount).fill(0)
		}

		this.randomize()
	}

	public randomize() {
		for (let i = 0; i < this.weights.length; i++) {
			for (let j = 0; j < this.weights[i].length; j++) {
				this.weights[i][j] = Math.random() * 2 - 1
			}
		}

		for (let i = 0; i < this.biases.length; i++) {
			this.biases[i] = Math.random() * 2 - 1
		}
	}

	public forward(inputs: number[]) {
		for (let i = 0; i < this.inputs.length; i++) {
			this.inputs[i] = inputs[i]
		}

		for (let i = 0; i < this.outputs.length; i++) {
			let sum = this.biases[i]

			for (let j = 0; j < this.inputs.length; j++) {
				sum += this.inputs[j] * this.weights[j][i]
			}

			this.weightedInputs[i] = sum
			this.outputs[i] = this.#activationFunction(sum)
		}

		return this.outputs
	}

	public updateGradients(nodeValues: number[]) {
		for (let i = 0; i < this.outputs.length; i++) {
			for (let j = 0; j < this.inputs.length; j++) {
				const derivative = this.inputs[j] * nodeValues[i]
				this.weightCostGradients[j][i] += derivative
			}

			this.biasCostGradients[i] += nodeValues[i]
		}
	}
}
