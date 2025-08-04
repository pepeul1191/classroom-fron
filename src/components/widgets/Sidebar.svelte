<script>
  import { navigate } from 'svelte-routing';
  import { activeLink } from '../../helpers/store.js';
	import { onMount } from 'svelte';

  export let userRoles;

  onMount(() => {

  });
</script>

<div class="sidebar d-none d-md-block">
  <div class="sidebar-header">
    <a class="navbar-brand text-dark" href="/" on:click|preventDefault={() => {navigate('/')}}>Gestión de Tickets</a>
  </div>
  <ul class="nav flex-column mt-3">
    <li class="nav-item">
      <a class="nav-link" class:active={$activeLink === '/'} href="/" on:click|preventDefault={() => {navigate('/')}}>
        <i class="fa fa-pie-chart me-2" aria-hidden="true"></i> Dashboard
      </a>
    </li>
    {#each userRoles as r}
      {#if r.name == 'admin'}
        <li class="nav-item">
          <a class="nav-link" href="#">
            <i class="fa fa-users me-2"></i> Usuarios
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" class:active={$activeLink === '/locations'} href="/locations" on:click|preventDefault={() => {navigate('/locations')}}>
            <i class="fa fa-map me-2"></i> Locaciones
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" class:active={$activeLink === '/issues'} href="/issues" on:click|preventDefault={() => {navigate('/issues')}}>
            <i class="fa fa-bug me-2"></i> Docentes
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" class:active={$activeLink === '/issues'} href="/issues" on:click|preventDefault={() => {navigate('/issues')}}>
            <i class="fa fa-bug me-2"></i> Alumnos
          </a>
        </li>
      {/if}
      {#if r.name == 'teacher'}
        <li class="nav-item">
          <a class="nav-link" class:active={$activeLink === '/issues'} href="/issues" on:click|preventDefault={() => {navigate('/issues')}}>
            <i class="fa fa-bug me-2"></i> Cursos
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" class:active={$activeLink === '/issues'} href="/issues" on:click|preventDefault={() => {navigate('/issues')}}>
            <i class="fa fa-bug me-2"></i> Mensajes
          </a>
        </li>
      {/if}
    {/each}

  </ul>
</div>
