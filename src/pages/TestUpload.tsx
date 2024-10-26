  import React, { useEffect, useState } from 'react';
  import IsLoggedIn from '../firebase/IsLoggedIn';
  import { supabase } from '../supabase/supabaseClient';
  import imageCompression from 'browser-image-compression';


  interface pubsType{
    publicUrl: string
  }

  const TestUpload = () => {
    // const [user] = IsLoggedIn();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const MAX_FILE_SIZE = 200 * 1024; // 200 KB
    const [imageUrl, setImageUrl] = useState<pubsType | null>(null); // Initialize as null

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const selectedFile = e.target.files?.[0] || null;

    //   // Validate file type and size
    //   if (selectedFile) {
    //     const isImage = selectedFile.type.startsWith('image/');
    //     const isUnderLimit = selectedFile.size <= MAX_FILE_SIZE;

    //     if (!isImage) {
    //       alert('Please select an image file.');
    //       setFile(null);
    //       return;
    //     }

    //     if (!isUnderLimit) {
    //       alert('File size must be less than 200 KB.');
    //       setFile(null);
    //       return;
    //     }

    //     setFile(selectedFile);
    //   }
    // };

  //   const uploadImage = async () => {
  //     if (!file || !user) return; // Ensure a file is selected and user is logged in
  //     try {
  //       setUploading(true);

  //       const compressedFile = await imageCompression(file, {
  //         maxSizeMB: 0.2, // Compress to max size 200 KB
  //         useWebWorker: true,
  //         maxWidthOrHeight: 50
  //       });
  //       // Use the user's UID for the path and a fixed name
  //       const filePath = `images/${user.uid}/profile_picture.jpg`; // Fixed file name for the profile picture

  //       // Remove the existing image (optional but recommended)
  //       await supabase.storage.from('profile').remove([filePath]);

  //       // Upload the image to the user's UID folder with a fixed name
  //       const { data, error } = await supabase.storage
  //         .from('profile')
  //         .upload(filePath, compressedFile); // No upsert; we remove the old one first

  //       if (error) {
  //         console.error('Error uploading file:', error.message);
  //       } else {
  //         console.log('File uploaded successfully:', data);
  //         // Fetch the new image URL after uploading
  //         fetchImage();
  //       }
  //     } catch (error) {
  //       console.error('Error uploading image:', error);
  //     } finally {
  //       setUploading(false);
  //     }
  //   };

  //   const fetchImage = async () => {
  //     if (!user) return; // Ensure user is logged in
  //     try {
  //         // Get the public URL for the fixed image name
  //         const { data: publicData, error: urlError }: any = supabase
  //             .storage
  //             .from('profile')
  //             .getPublicUrl(`images/${user.uid}/profile_picture.jpg`); // Always check for the same file

  //         if (urlError) {
  //             console.error('Error getting public URL:', urlError.message);
  //             setImageUrl(null); // Reset URL if there's an error
  //         } else {
  //           setImageUrl({ publicUrl: `${publicData.publicUrl}?t=${Date.now()}` });

  //         }
  //     } catch (error) {
  //         console.error('Error fetching image:', error);
  //     }
  // };


  //   // UseEffect to fetch image on component mount or when user changes
  //   useEffect(() => {
  //     if (user) {
  //       fetchImage();
  //     }
  //   }, [user, imageUrl?.publicUrl]);

  
    return (
      <div className='flex flex-col gap-5'>
        {/* Hello {user?.email} */}
        <div>
          {/* <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/gif" // Accept specific image types
            onChange={handleFileChange}
          />
          <button onClick={uploadImage} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>

          {imageUrl ? (
            <img 
            className='w-[30px] h-[30px] overflow-hidden rounded-full'
            src={imageUrl?.publicUrl} alt="User uploaded" />
          ) : (
            <p>No image found for this user.</p>
          )}
        </div>
        {imageUrl?.publicUrl} */}
{/* 
        <button onClick={() => {notifyUser()}}>show</button> */}
      </div>
      </div>
    );
  };

  export default TestUpload;
