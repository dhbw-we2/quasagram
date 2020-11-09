
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Home.vue') },
      { path: '/camera', component: () => import('pages/Camera.vue') },
      { path: '/register', component: () => import('pages/Register.vue') },
      { path: '/login', component: () => import('pages/Login.vue') }
    ]
  }
]

// Always leave this as last one
routes.push({
  path: '*',
  component: () => import('pages/Error404.vue')
})

export default routes
