import { JSX, createUniqueId, splitProps } from 'solid-js'

export default function Input(props: InputProps) {
	const id = createUniqueId()
	const [local, rest] = splitProps(props, ['label', 'class', 'onChange'])

	return (
		<div class="inline-grid grid-cols-1 justify-start text-md gap-1">
			{local.label && (
				<label for={`${id}-${rest.name}`} class="text-start font-bold">
					{local.label}:
				</label>
			)}
			<input
				id={`${id}-${rest.name}`}
				class={`${local.class} w-full rounded border-2 border-neutral-300/60 px-2 bg-transparent`}
				onChange={e => {
					if (props.type === 'number') {
						const value = e.currentTarget.valueAsNumber

						if (props.max !== undefined && value > +props.max) {
							e.currentTarget.valueAsNumber = +props.max
						}

						if (props.min !== undefined && value < +props.min) {
							e.currentTarget.valueAsNumber = +props.min
						}

						if (props.step !== undefined && props.step !== 'any') {
							const step = +props.step
							const div = value / step
							e.currentTarget.value = (Math.round(div) * step).toFixed(
								Math.abs(Math.log10(step))
							)
						}
					}

					local.onChange?.(e)
				}}
				{...rest}
			/>
		</div>
	)
}

type InputProps = Omit<
	JSX.InputHTMLAttributes<HTMLInputElement>,
	'onChange'
> & {
	name: string
	onChange?: JSX.EventHandler<HTMLInputElement, Event>
	type:
		| 'button'
		| 'checkbox'
		| 'color'
		| 'date'
		| 'datetime-local'
		| 'email'
		| 'file'
		| 'hidden'
		| 'image'
		| 'month'
		| 'number'
		| 'password'
		| 'radio'
		| 'range'
		| 'reset'
		| 'search'
		| 'submit'
		| 'tel'
		| 'text'
		| 'time'
		| 'url'
		| 'week'
} & (
		| {
				placeholder: string
				label: string
		  }
		| {
				placeholder?: undefined
				label: string
		  }
		| {
				label?: undefined
				placeholder: string
		  }
	)
