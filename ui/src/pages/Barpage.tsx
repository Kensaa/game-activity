import { useState } from 'react'
import { useInterval } from 'usehooks-ts'
import BarComponent from '../components/BarComponent'

export default function Barpage() {
    const [data, setData] = useState<Record<string, Record<string, number>>>({})

    const address =
        import.meta.env.MODE == 'production' ? '' : 'http://localhost:49072'

    useInterval(() => {
        fetch(`${address}/all`)
            .then(res => res.json())
            .then(data => setData(data))
    }, 1000)

    console.log(data)
    return (
        <div className='page'>
            <div className='content'>
                <div
                    style={{ width: '80%', height: '80%' }}
                    className='d-flex justify-content-center'
                >
                    <BarComponent data={data} />
                </div>
            </div>
        </div>
    )
}
