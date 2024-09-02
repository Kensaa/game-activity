import SingleDay from './pages/SingleDay'
import DateRange from './pages/DateRange'
import TotalTime from './pages/TotalTime'

export default function App() {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <SingleDay />
            <DateRange />
            <TotalTime />
        </div>
    )
}
