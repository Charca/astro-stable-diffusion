import { useState } from 'preact/hooks'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Prediction = {
  output: string[]
  status: string
}

function Form() {
  const [prediction, setPrediction] = useState<Prediction>({
    output: [],
    status: '',
  })
  const [error, setError] = useState(null)

  async function onSubmit(event: Event) {
    event.preventDefault()
    const formData = new FormData(event.target as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())
    const response = await fetch('/api/prediction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: data.prompt,
      }),
    })

    let prediction = await response.json()
    if (response.status !== 201) {
      setError(prediction.detail)
      return
    }

    setPrediction(prediction)

    console.log(prediction)

    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed'
    ) {
      await sleep(1000)
      const response = await fetch('/api/prediction/' + prediction.id)
      prediction = await response.json()

      if (response.status !== 200) {
        setError(prediction.detail)
        return
      }

      console.log({ prediction })
      setPrediction(prediction)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label for="prompt" class="block text-md font-medium text-gray-700 mb-2">
        Prompt
      </label>
      <div class="flex">
        <input
          class="block w-full flex-1 rounded-l-lg border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-md p-4"
          type="text"
          name="prompt"
          id="prompt"
          placeholder="an astronaut riding a horse on mars artstation, hd, dramatic lighting, detailed"
        />

        <button
          class="rounded-r-lg bg-indigo-600 px-4 text-base font-semibold leading-7 text-white shadow-sm  ring-indigo-600 hover:bg-indigo-700 hover:ring-indigo-700"
          type="submit"
        >
          Go &nbsp;
          <span class="text-indigo-200" aria-hidden="true">
            &rarr;
          </span>
        </button>
      </div>

      {error && <div>{error}</div>}

      {prediction.status && (
        <div class="mt-6">
          {prediction.output?.length > 0 ? (
            <div class="imageWrapper">
              <img
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes="100vw"
                class="rounded-md"
              />
            </div>
          ) : (
            <div
              class="mt-1 flex justify-center items-center  rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6"
              style={{ height: 768 }}
            >
              <div class="space-y-1 text-center">
                <div class="relative overflow-hidden rounded-full py-1.5 px-4 text-sm leading-6 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  <span class="text-gray-600">Status: {prediction.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  )
}

export default Form
