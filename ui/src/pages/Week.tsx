import { useState, useMemo } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import dataStore from '../stores/data'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
import { colors, convertSecondsToString, sortDays } from '../utils'

export default function Week() {
    const data = dataStore()
    const [numberOfDays, setNumberOfDays] = useState(7)

    if (Object.keys(data).length === 0) {
        return (
            <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
                Waiting for data...
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
                            value={numberOfDays}
                            onChange={e =>
                                setNumberOfDays(parseInt(e.target.value))
                            }
                            min={1}
                        />
                    </Form.Group>
                    <BarComponent data={data} dayCount={numberOfDays} />
                </div>
            </div>
        </div>
    )
}

export interface BarComponentProps {
    data: Record<string, Record<string, number>>
    dayCount?: number
}

function BarComponent({ data, dayCount = 7 }: BarComponentProps) {
    if (data === undefined) {
        return (
            <div className='h-100 d-flex justify-content-center align-items-center'>
                <Spinner animation='border' />
            </div>
        )
    }

    const barData = useMemo(() => {
        let selectedDays: Record<string, Record<string, number>> = {}
        let i = 0
        for (const day of sortDays(Object.keys(data)).reverse()) {
            if (i >= dayCount) break
            selectedDays[day] = data[day]
            i++
        }
        const days = sortDays(Object.keys(selectedDays))
        const differentsGames: string[] = []

        for (const day of days.map(day => selectedDays[day])) {
            for (const name of Object.keys(day)) {
                if (!differentsGames.includes(name)) {
                    differentsGames.push(name)
                }
            }
        }
        return {
            labels: days,
            datasets: differentsGames.map((game, i) => {
                const datasetData: number[] = []
                for (const day of days.map(day => selectedDays[day])) {
                    if (Object.keys(day).includes(game)) {
                        datasetData.push(day[game])
                    } else {
                        datasetData.push(0)
                    }
                }
                return {
                    label: game,
                    data: datasetData,
                    backgroundColor: [colors[i % colors.length]]
                }
            })
        }
    }, [data])

    return (
        <Bar
            data={barData}
            options={{
                responsive: true,
                scales: {
                    x: { stacked: true },
                    y: {
                        stacked: true,
                        ticks: {
                            callback: value => {
                                return convertSecondsToString(value as number)
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: item => {
                                return item[0].dataset.label
                            },
                            label: item => {
                                return convertSecondsToString(
                                    item.raw as number
                                )
                            }
                        }
                    }
                }
            }}
        />
    )
}
