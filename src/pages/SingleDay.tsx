import { useMemo, useState } from 'react'
import DatePicker from 'react-date-picker'
import { invoke } from '@tauri-apps/api/core'
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import {
    colors,
    convertSecondsToString,
    dateToString,
    useInterval
} from '../utils'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import DoughnutLabel from 'chartjs-plugin-doughnutlabel-rebourne'
ChartJS.register(ArcElement, Tooltip, Legend)

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

export default function SingleDay() {
    const [date, setDate] = useState<Value>(new Date())
    const [data, setData] = useState<Record<string, number>>({})
    useInterval(() => {
        if (!date) {
            setData({})
            return
        }
        let dateString = dateToString(date as Date)
        invoke('get_date_data', {
            date: dateString
        }).then(res => {
            setData(res as Record<string, number>)
        })
    }, 1000)

    const pieData = useMemo(() => {
        const labels = Object.keys(data)
        const values = Object.values(data)

        return {
            labels,
            datasets: [
                {
                    label: 'time spent',
                    data: values,
                    backgroundColor: colors
                }
            ]
        }
    }, [data])

    const totalTimeString = useMemo(() => {
        return convertSecondsToString(
            Object.values(data).reduce((acc, curr) => acc + curr, 0)
        )
    }, [data])

    return (
        <div className='page'>
            <DatePicker onChange={setDate} value={date} autoFocus={false} />
            <div className='graph'>
                <Doughnut
                    data={pieData}
                    // @ts-ignore
                    plugins={[DoughnutLabel]}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: item => {
                                        return convertSecondsToString(
                                            item.raw as number
                                        )
                                    }
                                }
                            },
                            //@ts-ignore
                            doughnutlabel: {
                                labels: [
                                    {
                                        text: 'Total :',
                                        font: {
                                            size: '28',
                                            family: 'Arial, Helvetica, sans-serif',
                                            weight: 'bold'
                                        }
                                    },
                                    {
                                        text: totalTimeString,
                                        font: {
                                            size: '20',
                                            family: 'Arial, Helvetica, sans-serif'
                                        }
                                    }
                                ]
                            }
                        }
                    }}
                />
            </div>
        </div>
    )
}
