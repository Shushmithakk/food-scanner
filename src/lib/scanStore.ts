let photoUri: string | null = null;

export const setPhotoUri = (uri: string | null) => {
  photoUri = uri;
};

export const getPhotoUri = () => photoUri;