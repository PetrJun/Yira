import { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext.js";
import { Container, Table, Card, Row, Col } from "react-bootstrap";

function Report() {
    const { loggedInUser } = useContext(UserContext);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (loggedInUser?.id) {
            fetch(`http://localhost:8000/api/project/getTasksAndProjectsOnUser/${loggedInUser.id}`)
                .then((r) => r.json())
                .then((data) => setTasks(data.filter((item) => !!item.projectId)))
                .catch(console.error);
        }
    }, [loggedInUser]);

    const countBy = (field, values) =>
        values.map((val) => ({
            value: val,
            count: tasks.filter((t) => t[field] === val).length,
        }));

    const byState    = countBy("state",    ["TODO", "INPROGRESS", "REVIEW", "DONE", "CANCELLED"]);
    const byType     = countBy("type",     ["BUG", "FEATURE", "IMPROVEMENT", "TASK"]);
    const bySeverity = countBy("severity", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
    const byPriority = countBy("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]);

    const byProject = Object.values(
        tasks.reduce((acc, t) => {
            if (!acc[t.projectId]) acc[t.projectId] = { name: t.projectName, count: 0 };
            acc[t.projectId].count++;
            return acc;
        }, {})
    )
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const total = tasks.length;

    return loggedInUser?.id ? (
        <Container className="py-3">
            <h4 className="mb-3">Report</h4>
            <Row className="g-3">
                <Col md={6}>
                    <ReportCard title="Dle stavu" rows={byState} total={total} />
                </Col>
                <Col md={6}>
                    <ReportCard title="Dle typu" rows={byType} total={total} />
                </Col>
                <Col md={6}>
                    <ReportCard title="Dle severity" rows={bySeverity} total={total} />
                </Col>
                <Col md={6}>
                    <ReportCard title="Dle priority" rows={byPriority} total={total} />
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header>Top projekty (počet tasků)</Card.Header>
                        <Card.Body className="p-0">
                            <Table size="sm" className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Projekt</th>
                                        <th>Počet</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {byProject.map((p) => (
                                        <tr key={p.name}>
                                            <td>{p.name}</td>
                                            <td>{p.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    ) : (
        <div style={messageStyle}>Nothing here :/ please login</div>
    );
}

function ReportCard({ title, rows, total }) {
    return (
        <Card>
            <Card.Header>{title}</Card.Header>
            <Card.Body className="p-0">
                <Table size="sm" className="mb-0">
                    <thead>
                        <tr>
                            <th>Hodnota</th>
                            <th>Počet</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.value}>
                                <td>{r.value}</td>
                                <td>{r.count}</td>
                                <td>{total > 0 ? Math.round((r.count / total) * 100) : 0} %</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
}

const messageStyle = {
    color: "red",
    fontSize: "3em",
    fontWeight: "bold",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
};

export default Report;
