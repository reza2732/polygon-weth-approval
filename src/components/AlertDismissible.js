import Alert from 'react-bootstrap/Alert'

export default function AlertDismissible({ show, message, setShowAlert, variant }) {
    if (show) {
        return (<Alert variant={variant} onClose={() => setShowAlert(false)} dismissible>
            <Alert.Heading>Failure</Alert.Heading>
            <p>{message}</p>
        </Alert>
        )
    }
    return null
}

AlertDismissible.defaultProps = {
    variant: "danger"
}