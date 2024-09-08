const getImage = (url)=>{
    fetch(url, { method: 'HEAD' })
    .then(res => {
        if (res.ok) {
            return url;
        } else {
            return "/data/blogs/default-img.png";
        }
    }).catch(err => console.log('Error:', err));
}