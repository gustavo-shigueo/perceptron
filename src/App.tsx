import { For, createEffect, createSignal } from 'solid-js'
import Input from './components/Input'
import NetworkCanvas from './components/NetworkCanvas'
import { Network } from './perceptron/Network'
import { DataPoint } from './perceptron/DataPoint'

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))
const sigmoidDerivative = (x: number) => {
	const y = sigmoid(x)
	return y * (1 - y)
}

function App() {
	let trainingDataInput: HTMLInputElement | undefined
	const [layers, setLayers] = createSignal<number[]>([2, 2])
	const [learnRate, setLearnRate] = createSignal(0.001)
	const [epochs, setEpochs] = createSignal(1_000)
	const [network, setNetwork] = createSignal<Network>(
		new Network(layers(), learnRate(), sigmoid, sigmoidDerivative)
	)
	const [inputs, setInputs] = createSignal([0, 0])

	createEffect(() => {
		setNetwork(
			() => new Network(layers(), learnRate(), sigmoid, sigmoidDerivative)
		)
	})

	return (
		<div class="grid gap-4">
			<h1>Perceptron Multi Camadas:</h1>

			<form
				onSubmit={async e => {
					e.preventDefault()
					if (!trainingDataInput) return

					const rawText = await trainingDataInput.files![0].text()

					const data = JSON.parse(rawText) as DataPoint[]

					if (
						!Array.isArray(data) ||
						data.some(x => x.input.length !== data[0].input.length) ||
						data.some(
							x => x.expectedOutput.length !== data[0].expectedOutput.length
						) ||
						data.some(x => x.input.some(y => typeof y !== 'number')) ||
						data.some(x => x.expectedOutput.some(y => typeof y !== 'number'))
					) {
						alert(
							'Formato de dados inválido! Verifique o exemplo e tente de novo'
						)
						return
					}

					for (let i = 0; i < epochs(); i++) {
						network().learn(data)
					}

					network().input(inputs())
					setNetwork(x => x.clone())
				}}
				enctype="multipart/form-data"
				class="grid gap-4"
			>
				<fieldset class="grid gap-2 grid-cols-4">
					<legend class="font-bold text-2xl mb-2">Configurações</legend>
					<Input
						name="learnRate"
						label="Taxa de aprendizado"
						type="number"
						value={learnRate()}
						onChange={e => setLearnRate(e.currentTarget.valueAsNumber)}
						step={0.001}
						min={0.001}
						max={1}
					/>

					<Input
						name="inputLayer"
						type="number"
						label="Número de entradas"
						min={1}
						value={layers()[0]}
						onChange={e => {
							setLayers(prev => {
								const value = e.currentTarget.valueAsNumber
								prev[0] = value

								return [...prev]
							})
							setInputs(prev => {
								const value = e.currentTarget.valueAsNumber
								if (value > prev.length) {
									prev.push(0)
								} else {
									prev.length = value
								}

								return [...prev]
							})
						}}
					/>

					<Input
						name="layerCount"
						label="Número de camadas ocultas"
						type="number"
						value={0}
						min={0}
						onChange={e => {
							const value = e.currentTarget.valueAsNumber
							if (value > layers().length - 2) {
								setLayers(prev => {
									prev.splice(value, 0, 1)
									return [...prev]
								})
							} else {
								setLayers(prev => {
									prev.splice(value + 1, 1)
									return [...prev]
								})
							}
						}}
					/>

					<Input
						name="outputLayer"
						type="number"
						label="Número de saídas"
						min={1}
						value={layers().at(-1)}
						onChange={e => {
							setLayers(prev => {
								const value = e.currentTarget.valueAsNumber
								prev[prev.length - 1] = value

								return [...prev]
							})
						}}
					/>

					<For each={new Array(layers().length - 2)}>
						{(_, index) => {
							return (
								<Input
									name={`layer${index()}`}
									type="number"
									label={`Número de neurônios na camada ${index() + 2}`}
									min={1}
									value={layers()[index() + 1]}
									onChange={e => {
										setLayers(prev => {
											const value = e.currentTarget.valueAsNumber
											prev[index() + 1] = value

											return [...prev]
										})
									}}
								/>
							)
						}}
					</For>
				</fieldset>

				<fieldset class="grid gap-2">
					<legend class="font-bold text-2xl mb-2">Dados de trainamento</legend>

					<div class="grid items-center">
						<Input
							type="file"
							name="trainingData"
							accept=".json"
							label="Dados de treinamento"
							required
							ref={trainingDataInput}
						/>
						<a class="text-start" href="data.json" download="example.json">
							Exemplo do formato dos dados
						</a>
					</div>

					<Input
						type="number"
						name="epochs"
						label="Número de iterações de treinamento"
						min={1}
						value={epochs()}
						onChange={e => setEpochs(e.currentTarget.valueAsNumber)}
					/>

					<button
						type="submit"
						class="bg-sky-600 font-bold self-end w-min mt-2"
					>
						Treinar
					</button>
				</fieldset>

				<fieldset class="grid gap-2">
					<legend class="font-bold text-2xl mb-2">Entradas:</legend>
					<For each={new Array(inputs().length)}>
						{(_, index) => {
							return (
								<Input
									name={`input${index()}`}
									step="any"
									type="number"
									label={`Valor da entrada ${index() + 1}`}
									value={inputs()[index()]}
									onChange={e => {
										setInputs(prev => {
											const value = e.currentTarget.valueAsNumber
											prev[index()] = value

											console.log(prev)

											network().input(prev)

											console.log(network())
											setNetwork(x => x.clone())
											return [...prev]
										})
									}}
								/>
							)
						}}
					</For>
				</fieldset>
			</form>

			<NetworkCanvas network={network()} />
		</div>
	)
}

export default App
