<template lang="html">
  <div>
    <div class="sidebar">
      <section class="cameras">
        <h2>Cameras</h2>
        <ul>
          <li v-if="cameras.length === 0" class="empty">No cameras found</li>
          <li v-for="camera in cameras">
            <span v-if="camera.id == activeCameraId" :title="formatName(camera.name)"
              class="active">{{ formatName(camera.name) }}</span>
            <span v-if="camera.id != activeCameraId" :title="formatName(camera.name)">
              <a @click.stop="selectCamera(camera)">{{ formatName(camera.name) }}</a>
            </span>
          </li>
        </ul>
      </section>
      <section class="scans">
        <h2>Scans</h2>
        <ul v-if="scans.length === 0">
          <li class="empty">No scans yet</li>
        </ul>
        <transition-group name="scans" tag="ul">
          <li v-for="scan in scans" :key="scan.date" :title="scan.content">{{ scan.content }}</li>
        </transition-group>
      </section>
    </div>
    <div class="preview-container">
      <video id="preview"></video>
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

      

      
    },

    mounted() {
      console.log(document.getElementById('preview'))
      const Instascan = this.$scan
      let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
      scanner.addListener('scan', function (content) {
        console.log('CONTENT', content);
        this.$http.post('/admin')
      });
      Instascan.Camera.getCameras().then(function (cameras) {
        self.cameras = cameras;
        console.log('DETECT :', cameras)
        if (cameras.length > 0) {
          scanner.activeCameraId = cameras[0].id;
          scanner.start(cameras[0]);
        } else {
          console.error('No cameras found.');
        }
      }).catch(function (e) {
        console.error(e);
      });
    },
    data() {
      return {
        
        user : [],  
        scanner: null,
        activeCameraId: null,
        cameras: [],
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
  }
</script>