<template lang="html">
  <div>
    <div class="sidebar">
      <section class="cameras">
        <h2>카메라 / 교번 {{ userID }}</h2>
        <ul>
          <li v-if="detectedCameras.length === 0" class="empty">No cameras found</li>
          <li v-for="camera in detectedCameras">
            <span v-if="camera.id == activeCameraId" :title="formatName(camera.name)"
              class="active">{{ formatName(camera.name) }} o </span>
            <span v-if="camera.id != activeCameraId" :title="formatName(camera.name)">
              <a @click.stop="selectCamera(camera)">{{ formatName(camera.name) }} x</a>
            </span>
          </li>
        </ul>
      </section>
      <section class="scans">
        <h2>결과 데이터</h2>
        <ul v-if="scans.length === 0">
          <li class="empty">No scans yet {{ userID}}</li>
        </ul>
        <transition-group name="scans" tag="ul">
          <li v-for="scan in scans" :key="scan.date" :title="scan.content">{{ scan.content }}</li>
        </transition-group>
      </section>
    </div>
    <div class="preview-container">
      <video id="preview" muted autoplay playsinline></video>
    </div>
  </div>
</template>
<style scoped>
  .row {
    background-image: url('../assets/flower_pattern.jpg');
    z-index: 1;
    height: 100vh;
  }
</style>


<script>
  export default {
    created() {
      console.log('교번 : ', this.$route.params.id )
      

      
    },

    mounted() {
      

      console.log(document.getElementById('preview'))
      const Instascan = this.$scan
      let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
      scanner.addListener('scan', (content, image) => {
        console.log('DETECT :', content)
        this.scans.unshift({ date: +(Date.now()), content: content });
        this.$http.post('/api/scan/user', {
          id : this.$route.params.id,
          key : content
        })
        .then(res => {
          console.log(res)
          alert(res.data.data.ssm_name)
        })
        .catch(err => {
          console.log(err)
        })

       

      });
      Instascan.Camera.getCameras()
        .then((cameras) => {
          this.detectedCameras = cameras;
          console.log('DETECT :', this.detectedCameras)
          if (cameras.length > 0) {
            console.log(cameras)
            this.activeCameraId = cameras[0].id;
            scanner.start(cameras[0]);
          } else {
            console.error('No cameras found.');
          }
        })
        .catch(function (e) {
          console.error(e);
        });
      },
    data() {
      return {
        props: ['id'],
        user : [],  
        scanner: null,
        activeCameraId: null,
        detectedCameras: [],
        scans: []
      }
    },
    methods: {
      formatName: function (name) {
      return name || '(unknown)';
    },
    selectCamera: function (camera) {
      this.activeCameraId = camera.id;
      this.scanner.start(camera);
    },
      
      goBack() {
        this.$router.push({ name: 'sasamo' })
      }


    },
    computed : {
      userID() {
        return this.$route.params.id
      }
    }
  }
</script>