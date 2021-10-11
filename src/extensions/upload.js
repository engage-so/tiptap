const unsignedUploadPreset = ''
const url = 'https://api.cloudinary.com/v1_1/engageso/upload'

function uploadFile (file) {
  return new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest()
    const fd = new window.FormData()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    xhr.onreadystatechange = function (e) {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // File uploaded successfully
        const response = JSON.parse(xhr.responseText)
        // const tokens = response.secure_url.split('/')
        // Set max image width of 800
        // tokens.splice(-2, 0, 'w_800,c_limit')
        // resolve(tokens.join('/'))
        resolve(response.secure_url)
      }
    }

    fd.append('upload_preset', unsignedUploadPreset)
    fd.append('tags', 'tiptap')
    fd.append('file', file)
    xhr.send(fd)
  })
}

export default uploadFile
