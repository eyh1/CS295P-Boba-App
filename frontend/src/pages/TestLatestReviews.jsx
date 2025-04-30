"use client"

import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import api from "../api";


function ApiButtonsPage() {
  const [firstApiData, setFirstApiData] = useState(null)
  const [error, setError] = useState(null)
  const [postId, setPostId] = useState(0)

  useEffect(() => {
      api.get("api/review/get_latest/")
        .then((res) => res.data)
        .then((data) => {
          setFirstApiData(data);
        })
        .catch((error) =>{

        console.log(error)});
    }, []);

 
  console.log(firstApiData)

  return (
    <div className="container py-5">
      <h1 className="mb-4">Latest Reviews Test</h1>

      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">

          {firstApiData && (
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Latest Reviews:</h5>
                <pre className="bg-light p-2 rounded">{JSON.stringify(firstApiData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

    </div>
  )
}

export default ApiButtonsPage
