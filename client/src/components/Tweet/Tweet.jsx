import axios from "axios";
import React, { useState, useEffect } from "react";
import formatDistance from "date-fns/formatDistance";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Tweet = ({ tweet, setData }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [userData, setUserData] = useState();
  const dateStr = formatDistance(new Date(tweet.createdAt), new Date());
  const location = useLocation().pathname;
  const { id } = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const findUser = await axios.get(`/users/find/${tweet.userId}`);
        setUserData(findUser.data);
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchData();
  }, [tweet.userId, tweet.likes]);

  const handleLike = async (e) => {
    e.preventDefault();

    try {
      const like = await axios.put(`/tweets/${tweet._id}/like`, {
        id: currentUser._id,
      });

      if (location.includes("profile")) {
        const newData = await axios.get(`/tweets/user/all/${id}`);
        setData(newData.data);
      } else if (location.includes("explore")) {
        const newData = await axios.get(`/tweets/explore`);
        setData(newData.data);
      } else {
        const newData = await axios.get(`/tweets/timeline/${currentUser._id}`);
        setData(newData.data);
      }
    } catch (err) {
      console.log("error", err);
    }
  };


  const handleDelete = async () => {
    try {
      await axios.delete(`/tweets/${tweet._id}`, {
        data: { id: currentUser._id },
      });
      // after deleting the tweet, refresh the data
      if (location.includes("profile")) {
        const newData = await axios.get(`/tweets/user/all/${id}`);
        setData(newData.data);
      } else if (location.includes("explore")) {
        const newData = await axios.get(`/tweets/explore`);
        setData(newData.data);
      } else {
        const newData = await axios.get(`/tweets/timeline/${currentUser._id}`);
        setData(newData.data);
      }
    } catch (err) {
      console.log("error", err);
    }
  };
  
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const updatedTweet = await axios.put(`/tweets/${tweet._id}`, {
        id: currentUser._id,
        description: editedDescription
      });
      setData((prevData) => {
        return prevData.map(t => t._id === updatedTweet.data._id ? updatedTweet.data : t);
      });
      setIsEditMode(false);
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      {userData && (
        <>
          <div className="flex space-x-2 items-center">
            <Link to={`/profile/${userData._id}`} className="hover:underline">
              <h3 className="font-bold">{userData.username}</h3>
            </Link>
            <span className="text-gray-500">@{userData.username}</span>
            <p className="text-gray-500"> - {dateStr}</p>
            {userData._id === currentUser._id && (
              <div className="flex ml-auto space-x-2">
                {isEditMode ? (
                  <>
                    <input 
                      type="text"
                      value={editedDescription} 
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="p-2 border rounded"
                    />
                    <button 
                      onClick={handleEdit}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsEditMode(false)}
                      className="p-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setEditedDescription(tweet.description);
                        setIsEditMode(true);
                      }}
                      className="text-yellow-600 rounded-full p-1 bg-yellow-100 hover:bg-yellow-200"
                      title="Edit Tweet"
                    >
                      <EditIcon />
                    </button>
                    <button 
                      onClick={handleDelete} 
                      className="text-red-500 rounded-full p-1 bg-red-100 hover:bg-red-200"
                      title="Delete Tweet"
                    >
                      <DeleteIcon />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {!isEditMode && (
            <>
              <p className="my-2">{tweet.description}</p>
              <button onClick={handleLike} className="flex items-center space-x-2">
                {tweet.likes.includes(currentUser._id) ? (
                  <FavoriteIcon className="cursor-pointer text-red-500" />
                ) : (
                  <FavoriteBorderIcon className="cursor-pointer text-gray-500" />
                )}
                <span>{tweet.likes.length}</span>
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Tweet;
