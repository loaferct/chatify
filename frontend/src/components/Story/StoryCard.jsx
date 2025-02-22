import React, { useEffect, useState } from 'react';
import { fetchStories } from '../../api/fetchstories/FetchStories'; // Import the fetchStories function
import axios from 'axios'; // Import axios for API requests

export default function StoryCard() {
  const [stories, setStories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // State to store the selected image
  const [imageToUpload, setImageToUpload] = useState(null); // State for the image selected for upload
  const [uploading, setUploading] = useState(false); // State to track upload status

  // Assuming you have a function to get the access token (e.g., from localStorage or context)
  const getAccessToken = () => {
    return localStorage.getItem('auth_token'); // Replace with your token retrieval logic
  };

  useEffect(() => {
    const getStories = async () => {
      try {
        const fetchedStories = await fetchStories(); // Call the function to fetch stories
        setStories(fetchedStories); // Set the stories to state
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    getStories();
  }, []); // Empty dependency array ensures the API call is made only once on mount

  // Handle image click to enlarge
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl); // Set the clicked image as selected
  };

  // Handle closing the enlarged image view
  const handleCloseImage = () => {
    setSelectedImage(null); // Reset the selected image to close the view
  };

  // Handle image upload input change
  const handleImageUploadChange = (event) => {
    const file = event.target.files[0];
    setImageToUpload(file); // Store the selected image file
  };

  const handleUploadStory = async () => {
    if (!imageToUpload) {
      alert('Please select an image to upload.');
      return;
    }
  
    const token = getAccessToken(); // Retrieve the access token
    if (!token) {
      alert('You must be logged in to upload a story.');
      return;
    }
  
    const formData = new FormData();
    formData.append('story_file', imageToUpload); // Append the image to formData under the 'story_file' key
  
    setUploading(true); // Set uploading state to true
  
    try {
      // Send the file to the backend with the token in the headers
      const response = await axios.post(
        'http://localhost:8000/stories/upload_story',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Pass the token in the header
            'Content-Type': 'multipart/form-data', // Ensure the correct content type
          },
        }
      );
  
      // Handle success
      console.log('Story uploaded successfully:', response.data);
      alert('Story uploaded successfully!');
    } catch (error) {
      // Log the error response to get more details
      console.error('Error uploading story:', error.response);
      alert('Failed to upload story. ' + error.response?.data?.detail || 'Unknown error.');
    } finally {
      setUploading(false); // Reset uploading state after the request
    }
  };
  
  

  return (
    <div
      style={{
        maxHeight: 'calc(100vh - 120px)', // Adjust max height of the content to fit inside the card with some margin
        overflowY: 'auto', // Enable scrolling if content overflows
        padding: '10px', // Add padding inside the container
      }}
    >
      <div>
        {/* Image upload section */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUploadChange} // Handle file input change
            style={{ marginBottom: '10px' }}
          />
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={handleUploadStory} // Trigger the upload on button click
            disabled={uploading} // Disable the button while uploading
          >
            {uploading ? 'Uploading...' : 'Upload Story'}
          </button>
        </div>

        {stories.length === 0 ? (
          <p>No stories available.</p>
        ) : (
          stories.map((story, index) => (
            <div
              key={index}
              style={{
                marginBottom: '20px', // Space between story boxes
                border: '2px solid #ddd', // Border around each story
                borderRadius: '12px', // Curved corners
                padding: '10px', // Padding inside each box
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)', // Subtle shadow for visibility
                backgroundColor: '#fff', // Background color for the story box
                width: '300px', // Fixed width for the story box
                height: '400px', // Fixed height for the story box
                overflow: 'hidden', // Ensures content doesn't overflow
                display: 'flex', // To allow the content inside the box to align properly
                flexDirection: 'column', // Stack content vertically
                alignItems: 'center', // Center the content inside the box
                justifyContent: 'center', // Vertically center the content
              }}
            >
              <h3>{story.friend_username}</h3>
              {/* Remove the 'stories/' prefix from the filename */}
              <img
                src={`http://localhost:8000/stories/story/${story.story_picture.split('stories/')[1]}`}
                alt={story.friend_username}
                width="200"
                style={{ marginBottom: '10px', cursor: 'pointer' }} // Add space below the image and make it clickable
                onClick={() => handleImageClick(`http://localhost:8000/stories/story/${story.story_picture.split('stories/')[1]}`)} // Handle image click
              />
              <p>Created At: {new Date(story.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      {/* Display the enlarged image in a modal-like view */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)', // Dark background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000', // Make sure the image is on top
          }}
          onClick={handleCloseImage} // Close image when clicked
        >
          <img
            src={selectedImage}
            alt="Enlarged story"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  );
}
