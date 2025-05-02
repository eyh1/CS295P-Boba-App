"use client"

import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import api from "../api";


function ApiButtonsPage() {
  const [firstApiData, setFirstApiData] = useState(null)
  const [isLoadingFirst, setIsLoadingFirst] = useState(false)
  const [isLoadingSecond, setIsLoadingSecond] = useState(false)
  const [error, setError] = useState(null)
  const [postId, setPostId] = useState(0)

  useEffect(() => {
      api.get("api/users/bookmarks/")
        .then((res) => res.data)
        .then((data) => {
          setFirstApiData(data);
        })
        .catch((error) =>{

        console.log(error)});
    }, []);

  const callSecondApi = async () => {
    setIsLoadingSecond(true)
    setError(null)

    try {
      await api.post(`/api/bookmark/${postId}/create/`);
    } catch (err) {
      setError(err.message || "An error occurred with the second API")
    } finally {
      setIsLoadingSecond(false)
    }
  }
  console.log(firstApiData)

  return (
    <div className="container py-5">
      <h1 className="mb-4">Bookmark Test</h1>

      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">

          {firstApiData && (
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Bookmarks:</h5>
                <pre className="bg-light p-2 rounded">{JSON.stringify(firstApiData, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="postId" className="form-label">
              Restaurant ID:
            </label>
            <div className="input-group">
              <input
                id="postId"
                type="number"
                className="form-control"
                min="1"
                max="100"
                value={postId}
                onChange={(e) => setPostId(Math.max(1, Number.parseInt(e.target.value) || 1))}
              />
              <button className="btn btn-outline-secondary" onClick={callSecondApi} disabled={isLoadingSecond}>
                {isLoadingSecond ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Loading...
                  </>
                ) : (
                  "Add bookmark"
                )}
              </button>
            </div>
          </div>
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
