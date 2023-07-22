import { useState, createContext } from 'react'
import Barpage from './pages/Barpage'
import Piepage from './pages/Piepage'
import { useInterval } from 'usehooks-ts'

export const dataContext = createContext<
    Record<string, Record<string, number>>
>({})

export default function App() {
    const [data, setData] = useState<Record<string, Record<string, number>>>({})

    const address =
        import.meta.env.MODE == 'production' ? '' : 'http://localhost:49072'
    useInterval(() => {
        fetch(`${address}/all/`)
            .then(res => res.json())
            .then(data => {
                const obj: Record<string, Record<string, number>> = {}
                for (const day of Object.keys(data)) {
                    obj[day.split('-').join('/')] = data[day]
                }
                return obj
            })
            .then(data => setData(data))
    }, 1000)
    return (
        <dataContext.Provider value={data}>
            <div className='w-100 h-100'>
                <Piepage />
                <Barpage />
            </div>
        </dataContext.Provider>
    )
}
