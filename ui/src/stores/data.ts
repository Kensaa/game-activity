import { create } from 'zustand'

type DataStore = Record<string, Record<string, number>>
const address =
    import.meta.env.MODE == 'production' ? '' : 'http://localhost:49072'

export default create<DataStore>(set => {
    setInterval(() => {
        fetch(`${address}/all/`)
            .then(res => res.json())
            .then(data => {
                const obj: Record<string, Record<string, number>> = {}
                for (const day of Object.keys(data)) {
                    obj[day.split('-').join('/')] = data[day]
                }
                return obj
            })
            .then(data => set(data))
    }, 1000)
    return {}
})
