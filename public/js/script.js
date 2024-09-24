async function deleteTask(taskId) {
    try {
        const response = await fetch(`http://localhost:5000/delete/${taskId}`,{
            method:"DELETE"
        });

        if (response.status) {
            window.location.href = "http://localhost:5000/dashboard";
        } else {
            console.error('Failed to delete task:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}