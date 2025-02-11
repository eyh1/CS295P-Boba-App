import React from "react"

const RestaurantList = ({restaurants}) => {

    return <div>
        <h2>Restaurants</h2>
        <table>
            <thead>
                <tr>
                    <th>Restaurant Name</th>
                    <th>Address</th>
                </tr>
            </thead>
            <tbody>
                {restaurants.map((restaurants) => (
                    <tr key={restaurants.id}>
                        <td>{restaurants.restaurantName}</td>
                        <td>{restaurants.address}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}

export default RestaurantList