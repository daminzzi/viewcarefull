package com.ssafy.ViewCareFull.domain.user.entity.user;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.DiscriminatorType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.validation.constraints.NotNull;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Users {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @Column(name = "domain_id")
  private String domainId;

  @NotNull
  @Column
  private String password;

  @NotNull
  @Column(name = "user_name")
  private String userName;

  @Column(name = "phone_number")
  private String phoneNumber;

  @Column
  private String email;

  @Column
  private String address;

  @Column
  private String brith;
}


