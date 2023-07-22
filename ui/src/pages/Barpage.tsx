import { useContext, useState } from 'react'
import BarComponent from '../components/BarComponent'
import { dataContext } from '../App'
import { Form, Spinner } from 'react-bootstrap'

export default function Barpage() {
    /*const [data, setData] = useState<Record<string, Record<string, number>>>({})

    const address =
        import.meta.env.MODE == 'production' ? '' : 'http://localhost:49072'

    useInterval(() => {
        fetch(`${address}/all`)
            .then(res => res.json())
            .then(data => setData(data))
    }, 1000)*/
    const [dayCount, setDayCount] = useState(7)
    const data = useContext(dataContext)

    if (Object.keys(data).length === 0) {
        return (
            <div className='h-100 d-flex justify-content-center align-items-center'>
                <Spinner animation='border' />
            </div>
        )
    }

    return (
        <div className='page'>
            <div className='content'>
                <div
                    style={{ width: '80%', height: '80%' }}
                    className='d-flex flex-column align-items-center'
                >
                    <Form.Group>
                        <Form.Label>Number of displayed days : </Form.Label>
                        <Form.Control
                            type='number'
                            value={dayCount}
                            onChange={e =>
                                setDayCount(parseInt(e.target.value))
                            }
                            min={1}
                        />
                    </Form.Group>
                    <BarComponent data={data} dayCount={dayCount} />
                </div>
            </div>
        </div>
    )
}
