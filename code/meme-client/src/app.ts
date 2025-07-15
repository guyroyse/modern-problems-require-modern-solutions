// @ts-ignore: Don't have time to play TypeScript Sudoku for something that should just work
const memeServerPort = import.meta.env.VITE_MEME_SERVER_PORT || 8080
const memeServerUrl = `http://localhost:${memeServerPort}`

const video = document.getElementById('video') as HTMLVideoElement
const canvas = document.getElementById('photo-canvas') as HTMLCanvasElement
const photo = document.getElementById('photo') as HTMLImageElement

const videoDisplay = document.getElementById('video-display') as HTMLDivElement
const cameraSelect = document.getElementById('camera-select') as HTMLSelectElement
const takePhotoButton = document.getElementById('take-photo') as HTMLButtonElement

const photoDisplay = document.getElementById('photo-display') as HTMLDivElement
const usePhotoButton = document.getElementById('use-photo') as HTMLButtonElement
const retakePhotoButton = document.getElementById('retake-photo') as HTMLButtonElement

const matchDisplay = document.getElementById('match-display') as HTMLDivElement
const matchTitle = document.getElementById('match-title') as HTMLHeadingElement
const userPhoto = document.getElementById('user-photo') as HTMLImageElement
const matchedPhoto = document.getElementById('matched-photo') as HTMLImageElement
const restartButton = document.getElementById('restart') as HTMLButtonElement

const cosineButton = document.getElementById('cosine') as HTMLButtonElement
const ipButton = document.getElementById('innerProduct') as HTMLButtonElement
const l2Button = document.getElementById('euclidean') as HTMLButtonElement

type Match = {
  id: string
  title: string
}

document.addEventListener('DOMContentLoaded', async () => {
  await initialize()
  showVideo()
})

cameraSelect.addEventListener('change', async () => {
  await setCamera(cameraSelect.value)
})

takePhotoButton.addEventListener('click', () => {
  takePhoto()
  showPhoto()
})

usePhotoButton.addEventListener('click', async () => {
  await usePhoto()
  showMatch()
})

retakePhotoButton.addEventListener('click', showVideo)
restartButton.addEventListener('click', showVideo)

cosineButton.addEventListener('click', useCosineMetric)
ipButton.addEventListener('click', useInnerProductMetric)
l2Button.addEventListener('click', useEuclideanMetric)

async function initialize() {
  /* Request camera permissions first to get device labels */
  try {
    await navigator.mediaDevices.getUserMedia({ video: true })
  } catch (error) {
    window.alert('Failed to access camera')
    return
  }

  /* Get the available video devices */
  const devices = await navigator.mediaDevices.enumerateDevices()
  const videoDevices = devices.filter(device => device.kind === 'videoinput')

  /* If there are no video devices, show an error */
  if (videoDevices.length === 0) {
    window.alert('No video devices found')
    return
  }

  /* Populate the camera select */
  videoDevices.forEach(device => {
    const option = document.createElement('option')
    option.value = device.deviceId
    option.text = device.label
    cameraSelect.appendChild(option)
  })

  /* Set the camera to the first device */
  const device = videoDevices[0] as MediaDeviceInfo
  await setCamera(device.deviceId)
}

async function setCamera(deviceId: string): Promise<void> {
  const constraints = { video: { deviceId: { exact: deviceId }, width: 1280, height: 720 } }
  const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
  video.srcObject = mediaStream
  await video.play()
}

function takePhoto(): void {
  /* Get the size of the video */
  const width = video.videoWidth
  const height = video.videoHeight

  /* Size the canvas to the short side of the video */
  const size = Math.min(width, height)
  canvas.width = size
  canvas.height = size

  /* Draw the video to the canvas */
  const x = width > height ? (width - height) / 2 : 0
  const y = width > height ? 0 : (height - width) / 2
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.drawImage(video, x, y, size, size, 0, 0, size, size)

  /* Set the photo element to the canvas image */
  photo.src = canvas.toDataURL('image/png')
}

async function usePhoto(): Promise<void> {
  return new Promise<void>((resolve, _) => {
    canvas.toBlob(async blob => {
      /* Send the image to the server and get a match */
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': blob!.type
        },
        body: blob
      }
      const response = await fetch(`${memeServerUrl}/match`, options)
      const match = (await response.json()) as Match

      console.log(match)

      /* Set the title and matched- and user-photos */
      matchTitle.textContent = match.title
      matchedPhoto.src = `${memeServerUrl}/image/${match.id}`
      userPhoto.src = photo.src

      /* Display the match elements */
      showMatch()

      /* Resolve the promise */
      resolve()
    })
  })
}

function useCosineMetric(): void {
  fetch(`${memeServerUrl}/metric/cosine`)
}

function useInnerProductMetric(): void {
  fetch(`${memeServerUrl}/metric/ip`)
}

function useEuclideanMetric(): void {
  fetch(`${memeServerUrl}/metric/l2`)
}

function hideAll(): void {
  hideElements(videoDisplay, photoDisplay, matchDisplay)
}

function showVideo(): void {
  hideElements(photoDisplay, matchDisplay)
  showElement(videoDisplay)
}

function showPhoto(): void {
  hideElements(videoDisplay, matchDisplay)
  showElement(photoDisplay)
}

function showMatch(): void {
  hideElements(videoDisplay, photoDisplay)
  showElement(matchDisplay)
}

function hideElements(...elements: HTMLElement[]): void {
  for (const element of elements) {
    element.classList.add('hidden')
    element.classList.remove('flex')
  }
}

function showElement(element: HTMLElement): void {
  element.classList.add('flex')
  element.classList.remove('hidden')
}

export {}
